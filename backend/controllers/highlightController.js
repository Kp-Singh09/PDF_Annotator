// backend/controllers/highlightController.js
const Highlight = require('../models/Highlight');
const PDF = require('../models/PDF');

exports.createHighlight = async (req, res) => {
    const { pdfUuid, text, position, pageNumber, color, intensity } = req.body;
    const userId = req.user.id;
    try {
        const pdf = await PDF.findOne({ uuid: pdfUuid, user: userId });
        if (!pdf) {
            return res.status(404).json({ success: false, message: 'PDF not found' });
        }
        const highlight = new Highlight({ pdf: pdf._id, user: userId, text, position, pageNumber, color, intensity: 1 });
        await highlight.save();
        res.status(201).json({ success: true, highlight });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getHighlights = async (req, res) => {
    const { pdfUuid } = req.params;
    const userId = req.user.id;
    try {
        const pdf = await PDF.findOne({ uuid: pdfUuid, user: userId });
        if (!pdf) {
            return res.status(404).json({ success: false, message: 'PDF not found for highlights query' });
        }
        const highlights = await Highlight.find({ pdf: pdf._id, user: userId });
        res.json({ success: true, highlights });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteHighlight = async (req, res) => {
    try {
        const highlight = await Highlight.findOne({ _id: req.params.id, user: req.user.id });
        if (!highlight) {
            return res.status(404).json({ success: false, message: 'Highlight not found' });
        }
        await highlight.deleteOne();
        res.json({ success: true, message: 'Highlight deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

