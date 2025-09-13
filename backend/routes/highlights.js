const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const {
    createHighlight,
    getHighlights,
    deleteHighlight,
    updateHighlight 
} = require('../controllers/highlightController');

router.post('/', auth, createHighlight);

router.put('/:id', auth, updateHighlight);

router.delete('/:id', auth, deleteHighlight);

router.get('/:pdfUuid', auth, getHighlights);

module.exports = router;