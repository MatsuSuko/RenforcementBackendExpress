const { EtapeDossier, Historique, dbInstance } = require('../models');

const getEtapesByDossier = async (req, res) => {
    const etapes = await EtapeDossier.findAll({
        where: { dossier_id: req.params.dossier_id }
    });
    return res.status(200).json({ etapes });
};

const createEtape = async (req, res) => {
    const transaction = await dbInstance.transaction();
    try {
        const { dossier_id, libelle, validation_requise, date_echeance } = req.body;

        const etape = await EtapeDossier.create({
            dossier_id,
            libelle,
            validation_requise,
            date_echeance,
            statut: 'en_attente'
        }, { transaction });

        await Historique.create({
            utilisateur_id: req.user?.id || 1,
            entite_type: 'etape',
            entite_id: etape.id,
            action: 'creation',
            detail: `Étape "${libelle}" créée`
        }, { transaction });

        await transaction.commit();
        return res.status(201).json({ etape });
    } catch (err) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Erreur lors de la création de l\'étape', stacktrace: err.errors });
    }
};

const validerEtape = async (req, res) => {
    const transaction = await dbInstance.transaction();
    try {
        const { commentaire } = req.body;

        const etape = await EtapeDossier.findOne({ where: { id: req.params.id } });
        if (!etape) return res.status(404).json({ message: 'Étape introuvable' });

        if (etape.validation_requise && !req.user?.role?.includes('gestionnaire')) {
            return res.status(403).json({ message: 'Validation par un gestionnaire requise' });
        }

        await EtapeDossier.update({
            statut: 'validee',
            valide: true,
            validateur_id: req.user?.id || null,
            commentaire,
            completed_at: new Date()
        }, { where: { id: req.params.id }, transaction });

        await Historique.create({
            utilisateur_id: req.user?.id || 1,
            entite_type: 'etape',
            entite_id: req.params.id,
            action: 'validation',
            detail: commentaire || 'Étape validée'
        }, { transaction });

        await transaction.commit();
        return res.status(200).json({ message: 'Étape validée' });
    } catch (err) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Erreur lors de la validation', stacktrace: err.errors });
    }
};

module.exports = { getEtapesByDossier, createEtape, validerEtape };
