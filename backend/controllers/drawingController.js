const Drawing = require('../models/Drawing');
const PDF = require('../models/PDF');

// Create a new drawing or shape
exports.createDrawing = async (req, res) => {
    const { pdfUuid, pageNumber, color, lineWidth, shape, path, startX, startY, endX, endY } = req.body;
    const userId = req.user.id;
    try {
        const pdf = await PDF.findOne({ uuid: pdfUuid, user: userId });
        if (!pdf) return res.status(404).json({ success: false, message: 'PDF not found' });
        const newDrawing = new Drawing({ pdf: pdf._id, user: userId, pageNumber, color, lineWidth, shape, path, startX, startY, endX, endY });
        await newDrawing.save();
        res.status(201).json({ success: true, drawing: newDrawing });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get all drawings for a specific PDF
exports.getDrawings = async (req, res) => {
    const { pdfUuid } = req.params;
    const userId = req.user.id;
    try {
        const pdf = await PDF.findOne({ uuid: pdfUuid, user: userId });
        if (!pdf) return res.status(404).json({ success: false, message: 'PDF not found' });
        const drawings = await Drawing.find({ pdf: pdf._id, user: userId });
        res.json({ success: true, drawings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// **NEW:** Update a drawing's position or properties
exports.updateDrawing = async (req, res) => {
    try {
        const drawing = await Drawing.findOne({ _id: req.params.id, user: req.user.id });
        if (!drawing) {
            return res.status(404).json({ success: false, message: 'Drawing not found' });
        }

        // Update fields provided in the request body
        const { path, startX, startY, endX, endY } = req.body;
        if (path) drawing.path = path;
        if (startX !== undefined) drawing.startX = startX;
        if (startY !== undefined) drawing.startY = startY;
        if (endX !== undefined) drawing.endX = endX;
        if (endY !== undefined) drawing.endY = endY;

        await drawing.save();
        res.json({ success: true, drawing });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


// Delete a specific drawing
exports.deleteDrawing = async (req, res) => {
    try {
        const drawing = await Drawing.findOne({ _id: req.params.id, user: req.user.id });
        if (!drawing) {
            return res.status(404).json({ success: false, message: 'Drawing not found' });
        }
        await drawing.deleteOne();
        res.json({ success: true, message: 'Drawing deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};