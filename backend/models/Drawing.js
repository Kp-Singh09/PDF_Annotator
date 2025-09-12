const mongoose = require('mongoose');

const DrawingSchema = new mongoose.Schema({
    pdf: { type: mongoose.Schema.Types.ObjectId, ref: 'PDF', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pageNumber: { type: Number, required: true },
    color: { type: String, default: '#000000' },
    lineWidth: { type: Number, default: 2 },
    // Shape type: 'freehand', 'rectangle', 'circle', 'arrow'
    shape: { type: String, required: true, default: 'freehand' },
    // For freehand drawings
    path: [{ x: Number, y: Number }],
    // For shapes (rectangle, circle, arrow)
    startX: { type: Number },
    startY: { type: Number },
    endX: { type: Number },
    endY: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Drawing', DrawingSchema);