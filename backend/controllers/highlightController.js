const Highlight = require('../models/Highlight');
const PDF = require('../models/PDF');


const createHighlight = async (req, res) => {
    const { pdfUuid, text, position, pageNumber, color, note } = req.body;
    const userId = req.user.id;
    try {
        const pdf = await PDF.findOne({ uuid: pdfUuid, user: userId });
        if (!pdf) {
            return res.status(404).json({ success: false, message: 'PDF not found' });
        }
        const newHighlight = new Highlight({
            pdf: pdf._id,
            user: userId,
            text,
            position,
            pageNumber,
            color,
            note
        });
        await newHighlight.save();
        res.status(201).json({ success: true, highlight: newHighlight });
    } catch (error) {
        console.error("Error creating highlight:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getHighlightsForPdf = async (req, res) => {
    const { pdfUuid } = req.params;
    const userId = req.user.id;
    try {
        const pdf = await PDF.findOne({ uuid: pdfUuid, user: userId });
        if (!pdf) {
            return res.status(404).json({ success: false, message: 'PDF not found' });
        }
        const highlights = await Highlight.find({ pdf: pdf._id, user: userId });
        res.json({ success: true, highlights });
    } catch (error) {
        console.error("Error fetching highlights:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


const updateHighlight = async (req, res) => {
    const { color, note } = req.body;
    try {
        const highlight = await Highlight.findOne({ _id: req.params.id, user: req.user.id });
        if (!highlight) {
            return res.status(404).json({ success: false, message: 'Highlight not found' });
        }
        if (color) highlight.color = color;
        if (note !== undefined) highlight.note = note;
        await highlight.save();
        res.json({ success: true, highlight });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete a highlight
const deleteHighlight = async (req, res) => {
    try {
        const highlight = await Highlight.findOne({ _id: req.params.id, user: req.user.id });
        if (!highlight) {
            return res.status(404).json({ success: false, message: 'Highlight not found' });
        }
        await highlight.deleteOne();
        res.json({ success: true, message: 'Highlight deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
  createHighlight,
  getHighlightsForPdf,
  updateHighlight,
  deleteHighlight
};