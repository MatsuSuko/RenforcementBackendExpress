const { Sinistre, DocumentSinistre, Dossier, Historique, User, dbInstance } = require('../models');

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

module.exports = { getAllSinistres, getSinistre, createSinistre, updateSinistre, deleteSinistre };
