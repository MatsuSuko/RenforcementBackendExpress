const { Sinistre, DocumentSinistre, Dossier, Historique, User, dbInstance } = require('../models');
const formidable = require('formidable');
const fs = require('fs');
const { sendDocumentRequestMail, sendRibRequestMail } = require('../utils/mailer');
require('dotenv').config();

const UPLOAD_DIR = './uploads/';

// ── GET ALL ───────────────────────────────────────────────────────────────────
const getAllSinistres = async (req, res) => {
    const sinistres = await Sinistre.findAll({
        include: [
            { model: User, as: 'Createur', attributes: ['id', 'firstname', 'lastname'] },
            { model: DocumentSinistre, as: 'Documents' },
            { model: Dossier, as: 'Dossier' }
        ]
    });
    return res.status(200).json({ sinistres });
};

// ── GET ONE ───────────────────────────────────────────────────────────────────
const getSinistre = async (req, res) => {
    const sinistre = await Sinistre.findOne({
        where: { id: req.params.id },
        include: [
            { model: User, as: 'Createur', attributes: ['id', 'firstname', 'lastname'] },
            { model: DocumentSinistre, as: 'Documents' },
            { model: Dossier, as: 'Dossier' }
        ]
    });
    if (!sinistre) return res.status(404).json({ message: 'Sinistre introuvable' });
    return res.status(200).json({ sinistre });
};

// ── CREATE ────────────────────────────────────────────────────────────────────
const createSinistre = async (req, res) => {
    const transaction = await dbInstance.transaction();
    try {
        const {
            immatriculation, conducteur_nom, conducteur_prenom,
            conducteur_est_assure, date_appel, date_accident,
            contexte, responsabilite_engagee, pourcentage_responsabilite
        } = req.body;

        const pourcentage = responsabilite_engagee ? (pourcentage_responsabilite || 0) : 0;

        const sinistre = await Sinistre.create({
            utilisateur_id: req.user?.id || 1,
            immatriculation,
            conducteur_nom,
            conducteur_prenom,
            conducteur_est_assure,
            date_appel,
            date_accident,
            contexte,
            responsabilite_engagee,
            pourcentage_responsabilite: pourcentage
        }, { transaction });

        await Historique.create({
            utilisateur_id: req.user?.id || 1,
            entite_type: 'sinistre',
            entite_id: sinistre.id,
            action: 'creation',
            detail: `Sinistre créé pour le véhicule ${immatriculation}`
        }, { transaction });

        await transaction.commit();
        return res.status(201).json({ sinistre });
    } catch (err) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Erreur lors de la création du sinistre', stacktrace: err.errors });
    }
};

// ── UPDATE ────────────────────────────────────────────────────────────────────
const updateSinistre = async (req, res) => {
    const transaction = await dbInstance.transaction();
    try {
        const {
            immatriculation, conducteur_nom, conducteur_prenom,
            conducteur_est_assure, date_appel, date_accident,
            contexte, responsabilite_engagee, pourcentage_responsabilite, statut
        } = req.body;

        await Sinistre.update({
            immatriculation, conducteur_nom, conducteur_prenom,
            conducteur_est_assure, date_appel, date_accident,
            contexte, responsabilite_engagee, pourcentage_responsabilite, statut
        }, { where: { id: req.params.id }, transaction });

        await Historique.create({
            utilisateur_id: req.user?.id || 1,
            entite_type: 'sinistre',
            entite_id: req.params.id,
            action: 'mise_a_jour',
            detail: `Sinistre mis à jour`
        }, { transaction });

        await transaction.commit();
        return res.status(200).json({ message: 'Sinistre mis à jour' });
    } catch (err) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Erreur lors de la mise à jour', stacktrace: err.errors });
    }
};

// ── DELETE ────────────────────────────────────────────────────────────────────
const deleteSinistre = async (req, res) => {
    const transaction = await dbInstance.transaction();
    try {
        await Sinistre.destroy({ where: { id: req.params.id }, transaction });
        await transaction.commit();
        return res.status(200).json({ message: 'Sinistre supprimé' });
    } catch (err) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Erreur lors de la suppression', stacktrace: err.errors });
    }
};

// ── UPLOAD DOCUMENT ───────────────────────────────────────────────────────────
const setSinistreDocument = async (req, res) => {
    const { id } = req.params;

    // Vérifier que le sinistre existe
    const sinistre = await Sinistre.findOne({ where: { id } });
    if (!sinistre) return res.status(404).json({ message: 'Sinistre introuvable' });

    try {
        const form = new formidable.IncomingForm();

        form.parse(req, async (err, fields, files) => {
            if (err) return res.status(400).json({ message: 'Erreur de parsing', err });

            const file = files.file?.[0];
            if (!file) return res.status(400).json({ message: 'Aucun fichier reçu' });

            const type = fields.type?.[0] || 'piece_identite';
            const validTypes = ['attestation_assurance', 'carte_grise', 'piece_identite'];
            if (!validTypes.includes(type)) {
                return res.status(400).json({ message: `Type invalide. Valeurs : ${validTypes.join(', ')}` });
            }

            const filename = Date.now().toString() + '-' + file.originalFilename;
            const newpath  = UPLOAD_DIR + filename;

            if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

            fs.copyFile(file.filepath, newpath, async (copyErr) => {
                if (copyErr) return res.status(500).json({ message: 'Erreur lors de la sauvegarde du fichier' });

                try {
                    const document = await DocumentSinistre.create({
                        sinistre_id: parseInt(id),
                        type,
                        chemin_fichier: filename,
                    });

                    return res.status(201).json({ message: 'Document uploadé', document });
                } catch (dbErr) {
                    return res.status(500).json({ message: 'Erreur lors de l\'enregistrement en BDD', err: dbErr });
                }
            });
        });
    } catch (err) {
        return res.status(400).json({ message: 'Erreur upload', err });
    }
};

// ── DOWNLOAD / STREAM DOCUMENT ────────────────────────────────────────────────
const getFile = (req, res) => {
    const filepath = UPLOAD_DIR + req.params.pathname;
    if (fs.existsSync(filepath)) {
        const readStream = fs.createReadStream(filepath);
        readStream.pipe(res);
    } else {
        return res.status(404).json({ message: 'Fichier introuvable' });
    }
};

// ── DELETE DOCUMENT ───────────────────────────────────────────────────────────
const deleteDocument = async (req, res) => {
    const doc = await DocumentSinistre.findOne({ where: { id: req.params.docId } });
    if (!doc) return res.status(404).json({ message: 'Document introuvable' });

    const filepath = UPLOAD_DIR + doc.chemin_fichier;
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);

    await doc.destroy();
    return res.status(200).json({ message: 'Document supprimé' });
};

// ── DEMANDE DE DOCUMENTS PAR MAIL ─────────────────────────────────────────────
const requestDocuments = async (req, res) => {
    try {
        const sinistre = await Sinistre.findOne({ where: { id: req.params.id } });
        if (!sinistre) return res.status(404).json({ message: 'Sinistre introuvable' });

        const types = req.body.types || ['attestation_assurance', 'carte_grise', 'piece_identite'];
        const targetUserId = sinistre.utilisateur_id;
        const user = await User.findOne({ where: { id: targetUserId } });
        if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

        await sendDocumentRequestMail(user, sinistre, types);
        return res.status(200).json({ message: 'Mail de demande de documents envoyé' });
    } catch (err) {
        return res.status(500).json({ message: 'Erreur lors de l\'envoi du mail', err: err.message });
    }
};

// ── DEMANDE DE RIB PAR MAIL ───────────────────────────────────────────────────
const requestRib = async (req, res) => {
    try {
        const sinistre = await Sinistre.findOne({ where: { id: req.params.id } });
        if (!sinistre) return res.status(404).json({ message: 'Sinistre introuvable' });

        const targetUserId = sinistre.utilisateur_id;
        const user = await User.findOne({ where: { id: targetUserId } });
        if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

        await sendRibRequestMail(user, sinistre);
        return res.status(200).json({ message: 'Mail de demande de RIB envoyé' });
    } catch (err) {
        return res.status(500).json({ message: 'Erreur lors de l\'envoi du mail', err: err.message });
    }
};

module.exports = {
    getAllSinistres, getSinistre, createSinistre,
    updateSinistre, deleteSinistre,
    setSinistreDocument, getFile, deleteDocument,
    requestDocuments, requestRib,
};
