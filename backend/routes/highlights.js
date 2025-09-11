// backend/routes/highlights.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const { 
    createHighlight, 
    getHighlights, 
    deleteHighlight, 
    updateHighlightIntensity,
    updateHighlight // Assuming you might have this from an older version
} = require('../controllers/highlightController');

// GET highlights for a specific PDF using its UUID
// FIX: The parameter must be named 'pdfUuid' to match the controller
router.get('/:pdfUuid', auth, getHighlights);

// POST a new highlight
router.post('/', auth, createHighlight);

// DELETE a specific highlight by its own _id
router.delete('/:id', auth, deleteHighlight);

// PUT to update a highlight's intensity by its own _id
router.put('/:id/intensity', auth, updateHighlightIntensity);

// (Optional) If you have an updateHighlight function for text/color, ensure its route is correct too
if (updateHighlight) {
    router.put('/:id', auth, updateHighlight);
}

module.exports = router;