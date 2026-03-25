const { Dossier, Sinistre, EtapeDossier, User, Historique, dbInstance } = require('../models');

const getAllDossiers = async (req, res) => {
    const dossiers = await Dossier.findAll({
        include: [
            { model: Sinistre, as: 'Sinistre' },
            { model: User, as: 'ChargeSuivi', attributes: ['id', 'firstname', 'lastname'] },
            { model: EtapeDossier, as: 'Etapes' }
        ]
    });
    return res.status(200).json({ dossiers });
};

const getDossier = async (req, res) => {
    const dossier = await Dossier.findOne({
        where: { id: req.params.id },
        include: [
            { model: Sinistre, as: 'Sinistre' },
            { model: User, as: 'ChargeSuivi', attributes: ['id', 'firstname', 'lastname'] },
            { model: EtapeDossier, as: 'Etapes' }
        ]
    });
    if (!dossier) return res.status(404).json({ message: 'Dossier introuvable' });
    return res.status(200).json({ dossier });
};

const createDossier = async (req, res) => {
    const transaction = await dbInstance.transaction();
    try {
        const { sinistre_id, charge_suivi_id, scenario } = req.body;

        const numero_dossier = `DOS-${Date.now()}`;

        const dossier = await Dossier.create({
            sinistre_id,
            charge_suivi_id,
            numero_dossier,
            scenario,
            statut: 'initialise'
        }, { transaction });

        await Historique.create({
            utilisateur_id: req.user?.id || 1,
            entite_type: 'dossier',
            entite_id: dossier.id,
            action: 'creation',
            detail: `Dossier ${numero_dossier} créé`
        }, { transaction });

        await transaction.commit();
        return res.status(201).json({ dossier });
    } catch (err) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Erreur lors de la création du dossier', stacktrace: err.errors });
    }
};

const updateStatutDossier = async (req, res) => {
    const transaction = await dbInstance.transaction();
    try {
        const { statut, scenario } = req.body;

        await Dossier.update(
            { statut, scenario },
            { where: { id: req.params.id }, transaction }
        );

        await Historique.create({
            utilisateur_id: req.user?.id || 1,
            entite_type: 'dossier',
            entite_id: req.params.id,
            action: 'changement_statut',
            detail: `Statut mis à jour : ${statut}`
        }, { transaction });

        await transaction.commit();
        return res.status(200).json({ message: 'Statut du dossier mis à jour' });
    } catch (err) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Erreur lors de la mise à jour', stacktrace: err.errors });
    }
};

module.exports = { getAllDossiers, getDossier, createDossier, updateStatutDossier };
