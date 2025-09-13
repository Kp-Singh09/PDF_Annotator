const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// **FIXED:** Changed 'getHighlights' to 'getHighlightsForPdf' to match the controller
const {
    createHighlight,
    getHighlightsForPdf,
    updateHighlight,
    deleteHighlight,
} = require('../controllers/highlightController');

// @route   POST /api/highlights
// @desc    Create a highlight
// @access  Private
router.post('/', auth, createHighlight);

// @route   GET /api/highlights/:pdfUuid
// @desc    Get highlights for a PDF
// @access  Private
// **FIXED:** Changed 'getHighlights' to 'getHighlightsForPdf'
router.get('/:pdfUuid', auth, getHighlightsForPdf);

// @route   PUT /api/highlights/:id
// @desc    Update a highlight (e.g., add a note or change color)
// @access  Private
router.put('/:id', auth, updateHighlight);

// @route   DELETE /api/highlights/:id
// @desc    Delete a highlight
// @access  Private
router.delete('/:id', auth, deleteHighlight);

module.exports = router;