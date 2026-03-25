const express = require('express');
const router = express.Router();
const { getAllDossiers, getDossier, createDossier, updateStatutDossier } = require('../services/dossiers');
const { getEtapesByDossier, createEtape } = require('../services/etapes');

router.get('/', getAllDossiers);
router.get('/:id', getDossier);
router.post('/', createDossier);
router.put('/:id/statut', updateStatutDossier);

router.get('/:dossier_id/etapes', getEtapesByDossier);
router.post('/:dossier_id/etapes', createEtape);

module.exports = router;
