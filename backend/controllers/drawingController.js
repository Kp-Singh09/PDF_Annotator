const Drawing = require('../models/Drawing');
const PDF = require('../models/PDF');

// Create a new drawing
exports.createDrawing = async (req, res) => {
    const { pdfUuid, pageNumber, path, color, lineWidth } = req.body;
    const userId = req.user.id;

    try {
        const pdf = await PDF.findOne({ uuid: pdfUuid, user: userId });
        if (!pdf) {
            return res.status(404).json({ success: false, message: 'PDF not found' });
        }

        const newDrawing = new Drawing({
            pdf: pdf._id,
            user: userId,
            pageNumber,
            path,
            color,
            lineWidth,
        });

        await newDrawing.save();
        res.status(201).json({ success: true, drawing: newDrawing });
    } catch (error) {
        console.error("Error creating drawing:", error);
        res.status(500).json({ success: false, message: 'Server error while creating drawing' });
    }
};

// Get all drawings for a specific PDF
exports.getDrawings = async (req, res) => {
    const { pdfUuid } = req.params;
    const userId = req.user.id;

    try {
        const pdf = await PDF.findOne({ uuid: pdfUuid, user: userId });
        if (!pdf) {
            return res.status(404).json({ success: false, message: 'PDF not found' });
        }

        const drawings = await Drawing.find({ pdf: pdf._id, user: userId });
        res.json({ success: true, drawings });
    } catch (error) {
        console.error("Error fetching drawings:", error);
        res.status(500).json({ success: false, message: 'Server error while fetching drawings' });
    }
};