// backend/routes/highlights.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const {
    createHighlight,
    getHighlights,
    deleteHighlight,
    updateHighlightIntensity
} = require('../controllers/highlightController');

// --- CORRECTED ROUTE ORDER ---

// POST /api/highlights/
router.post('/', auth, createHighlight);

// DELETE /api/highlights/:id
router.delete('/:id', auth, deleteHighlight);

// GET /api/highlights/:pdfUuid
router.get('/:pdfUuid', auth, getHighlights);

module.exports = router;