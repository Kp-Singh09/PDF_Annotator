// backend/controllers/highlightController.js
const Highlight = require('../models/Highlight');
const PDF = require('../models/PDF');

exports.createHighlight = async (req, res) => {
    const { pdfUuid, text, position, pageNumber, color } = req.body;
    const userId = req.user.id;
    try {
        const pdf = await PDF.findOne({ uuid: pdfUuid, user: userId });
        if (!pdf) {
            return res.status(404).json({ success: false, message: 'PDF not found' });
        }
        const highlight = new Highlight({ pdf: pdf._id, user: userId, text, position, pageNumber, color });
        await highlight.save();
        res.status(201).json({ success: true, highlight });
    } catch (error) {
        console.error("Error creating highlight:", error);
        res.status(500).json({ success: false, message: 'Server error while creating highlight' });
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
        console.error("Error getting highlights:", error);
        res.status(500).json({ success: false, message: 'Server error while fetching highlights' });
    }
};

// NEW: Add an update function for changing color
exports.updateHighlight = async (req, res) => {
    try {
        const { color } = req.body;
        // Find the highlight by its ID and ensure it belongs to the logged-in user
        const highlight = await Highlight.findOne({ _id: req.params.id, user: req.user.id });

        if (!highlight) {
            return res.status(404).json({ success: false, message: 'Highlight not found' });
        }

        // Update the color if it's provided in the request body
        if (color) {
            highlight.color = color;
        }
        
        await highlight.save();
        res.json({ success: true, highlight });
    } catch (error){
        console.error("Error updating highlight:", error);
        res.status(500).json({ success: false, message: 'Server error while updating highlight' });
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
        console.error("Error deleting highlight:", error);
        res.status(500).json({ success: false, message: 'Server error while deleting highlight' });
    }
};