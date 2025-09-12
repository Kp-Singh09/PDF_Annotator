const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createDrawing, getDrawings } = require('../controllers/drawingController');

// POST /api/drawings - Create a new drawing
router.post('/', auth, createDrawing);

// GET /api/drawings/:pdfUuid - Get all drawings for a PDF
router.get('/:pdfUuid', auth, getDrawings);

module.exports = router;