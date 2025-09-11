const express = require('express');
const { 
  createHighlight, 
  getHighlights, 
  updateHighlight, 
  deleteHighlight 
} = require('../controllers/highlightController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, createHighlight);
router.get('/:uuid', auth, getHighlights);
router.put('/:id', auth, updateHighlight);
router.delete('/:id', auth, deleteHighlight);

module.exports = router;