// backend/routes/highlights.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const {
    createHighlight,
    getHighlights,
    deleteHighlight,
    updateHighlight // Import the new update function
} = require('../controllers/highlightController');

// --- ROUTE ORDER IS IMPORTANT ---

// POST /api/highlights/
router.post('/', auth, createHighlight);

// NEW: Add PUT route for updating a highlight by its ID
// PUT /api/highlights/:id
router.put('/:id', auth, updateHighlight);

// DELETE /api/highlights/:id
router.delete('/:id', auth, deleteHighlight);

// GET /api/highlights/:pdfUuid
// This must be last, so it doesn't mistakenly catch requests for '/:id'
router.get('/:pdfUuid', auth, getHighlights);

module.exports = router;