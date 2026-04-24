const express = require('express');
const router = express.Router();
const {
    getAllSinistres, getSinistre, createSinistre,
    updateSinistre, deleteSinistre,
    setSinistreDocument, getFile, deleteDocument,
    requestDocuments, requestRib
} = require('../services/sinistres');
const { canModifySinistre } = require('../middlewares/auth');

// ⚠️ Les routes statiques DOIVENT être avant les routes dynamiques (:id)
router.get('/download-docs/:pathname', getFile);

router.get('/',    getAllSinistres);
router.get('/:id', getSinistre);
router.post('/',   createSinistre);
router.put('/:id',    canModifySinistre, updateSinistre);
router.delete('/:id', canModifySinistre, deleteSinistre);

// Documents
router.post('/:id/document',          setSinistreDocument);
router.delete('/:id/document/:docId', deleteDocument);

// Notifications par mail
router.post('/:id/request-documents', requestDocuments);
router.post('/:id/request-rib',       requestRib);

module.exports = router;
