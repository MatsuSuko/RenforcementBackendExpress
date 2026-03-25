const express = require('express');
const router = express.Router();
const { getAllSinistres, getSinistre, createSinistre, updateSinistre, deleteSinistre } = require('../services/sinistres');

router.get('/', getAllSinistres);
router.get('/:id', getSinistre);
router.post('/', createSinistre);
router.put('/:id', updateSinistre);
router.delete('/:id', deleteSinistre);

module.exports = router;
