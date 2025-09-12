const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
// Import the new updateDrawing function
const { createDrawing, getDrawings, deleteDrawing, updateDrawing } = require('../controllers/drawingController');

// POST /api/drawings - Create a new drawing
router.post('/', auth, createDrawing);

// GET /api/drawings/:pdfUuid - Get all drawings for a PDF
router.get('/:pdfUuid', auth, getDrawings);

// **NEW:** PUT /api/drawings/:id - Update a specific drawing (for moving)
router.put('/:id', auth, updateDrawing);

// DELETE /api/drawings/:id - Delete a specific drawing by its ID
router.delete('/:id', auth, deleteDrawing);

module.exports = router;