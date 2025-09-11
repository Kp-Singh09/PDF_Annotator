const express = require('express');
const { 
  uploadPDF, 
  getUserPDFs, 
  getPDF, 
  deletePDF, 
  renamePDF 
} = require('../controllers/pdfController');
const auth = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const router = express.Router();

router.post('/upload', auth, upload.single('pdf'), handleUploadError, uploadPDF);
router.get('/my-pdfs', auth, getUserPDFs);
router.get('/:uuid', auth, getPDF);
router.delete('/:uuid', auth, deletePDF);
router.put('/:uuid/rename', auth, renamePDF);

module.exports = router;