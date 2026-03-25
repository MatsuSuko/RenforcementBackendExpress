const express = require('express');
const router = express.Router();
const { validerEtape } = require('../services/etapes');

router.put('/:id/valider', validerEtape);

module.exports = router;
