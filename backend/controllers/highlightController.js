const Highlight = require('../models/Highlight');
const PDF = require('../models/PDF');

// Create highlight
exports.createHighlight = async (req, res) => {
  try {
    const { pdfUuid, pageNumber, text, position, color } = req.body;

    // Find PDF
    const pdf = await PDF.findOne({ uuid: pdfUuid, user: req.user.id });
    if (!pdf) {
      return res.status(404).json({ 
        success: false, 
        message: 'PDF not found' 
      });
    }

    const highlight = new Highlight({
      pdf: pdf._id,
      user: req.user.id,
      pageNumber,
      text,
      position,
      color: color || '#ffeb3b'
    });

    await highlight.save();
    
    // Populate PDF info
    await highlight.populate('pdf', 'uuid originalName');

    res.status(201).json({
      success: true,
      highlight
    });
  } catch (error) {
    console.error('Create highlight error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error creating highlight' 
    });
  }
};

// Get highlights for PDF
exports.getHighlights = async (req, res) => {
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

    const highlights = await Highlight.find({ 
      pdf: pdf._id, 
      user: req.user.id 
    }).sort({ pageNumber: 1, createdAt: 1 });

    res.json({
      success: true,
      highlights,
      count: highlights.length
    });
  } catch (error) {
    console.error('Get highlights error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching highlights' 
    });
  }
};

// Update highlight
exports.updateHighlight = async (req, res) => {
  try {
    const { text, color } = req.body;

    const highlight = await Highlight.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { text, color },
      { new: true, runValidators: true }
    ).populate('pdf', 'uuid originalName');

    if (!highlight) {
      return res.status(404).json({ 
        success: false, 
        message: 'Highlight not found' 
      });
    }

    res.json({
      success: true,
      highlight
    });
  } catch (error) {
    console.error('Update highlight error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating highlight' 
    });
  }
};

// Delete highlight
exports.deleteHighlight = async (req, res) => {
  try {
    const highlight = await Highlight.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!highlight) {
      return res.status(404).json({ 
        success: false, 
        message: 'Highlight not found' 
      });
    }

    res.json({
      success: true,
      message: 'Highlight deleted successfully'
    });
  } catch (error) {
    console.error('Delete highlight error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error deleting highlight' 
    });
  }
};