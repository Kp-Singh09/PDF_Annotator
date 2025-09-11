const PDF = require('../models/PDF');
const Highlight = require('../models/Highlight');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Upload PDF
exports.uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please upload a PDF file' 
      });
    }

    const uuid = uuidv4();
    const pdf = new PDF({
      uuid,
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      user: req.user.id,
      size: req.file.size
    });

    await pdf.save();
    
    // Populate user info
    await pdf.populate('user', 'name email');

    res.status(201).json({
      success: true,
      pdf
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during upload' 
    });
  }
};

// Get all PDFs for user
exports.getUserPDFs = async (req, res) => {
  try {
    const pdfs = await PDF.find({ user: req.user.id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      pdfs,
      count: pdfs.length
    });
  } catch (error) {
    console.error('Get PDFs error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching PDFs' 
    });
  }
};

// Get single PDF
exports.getPDF = async (req, res) => {
  try {
    const pdf = await PDF.findOne({ 
      uuid: req.params.uuid, 
      user: req.user.id 
    }).populate('user', 'name email');

    if (!pdf) {
      return res.status(404).json({ 
        success: false, 
        message: 'PDF not found' 
      });
    }

    res.json({
      success: true,
      pdf
    });
  } catch (error) {
    console.error('Get PDF error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching PDF' 
    });
  }
};

// Delete PDF
exports.deletePDF = async (req, res) => {
  try {
    const pdf = await PDF.findOne({ 
      uuid: req.params.uuid, 
      user: req.user.id 
    });

    if (!pdf) {
      return res.status(404).json({ 
        success: false, 
        message: 'PDF not found' 
      });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', pdf.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete all highlights associated with this PDF
    await Highlight.deleteMany({ pdf: pdf._id });

    // Delete PDF record
    await PDF.findByIdAndDelete(pdf._id);

    res.json({
      success: true,
      message: 'PDF deleted successfully'
    });
  } catch (error) {
    console.error('Delete PDF error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting PDF' 
    });
  }
};

// Rename PDF
exports.renamePDF = async (req, res) => {
  try {
    const { originalName } = req.body;
    
    if (!originalName) {
      return res.status(400).json({ 
        success: false, 
        message: 'New name is required' 
      });
    }

    const pdf = await PDF.findOneAndUpdate(
      { uuid: req.params.uuid, user: req.user.id },
      { originalName },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!pdf) {
      return res.status(404).json({ 
        success: false, 
        message: 'PDF not found' 
      });
    }

    res.json({
      success: true,
      pdf
    });
  } catch (error) {
    console.error('Rename PDF error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error renaming PDF' 
    });
  }
};
exports.getPdfDetails = async (req, res) => {
  try {
      const pdf = await PDF.findOne({ uuid: req.params.pdfId, user: req.user.id });
      if (!pdf) {
          return res.status(404).json({ message: 'PDF not found' });
      }
      res.json(pdf);
  } catch (error) {
      console.error('Error fetching PDF details:', error);
      res.status(500).json({ message: 'Server error' });
  }
};