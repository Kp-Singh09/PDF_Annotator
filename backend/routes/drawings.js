const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const { createDrawing, getDrawings, deleteDrawing, updateDrawing } = require('../controllers/drawingController');

router.post('/', auth, createDrawing);

router.get('/:pdfUuid', auth, getDrawings);

router.put('/:id', auth, updateDrawing);

router.delete('/:id', auth, deleteDrawing);

module.exports = router;