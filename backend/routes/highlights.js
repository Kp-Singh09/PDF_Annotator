const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const {
    createHighlight,
    getHighlightsForPdf,
    updateHighlight,
    deleteHighlight,
} = require('../controllers/highlightController');

router.post('/', auth, createHighlight);

router.get('/:pdfUuid', auth, getHighlightsForPdf);

router.put('/:id', auth, updateHighlight);

router.delete('/:id', auth, deleteHighlight);

module.exports = router;