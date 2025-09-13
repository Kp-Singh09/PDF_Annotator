const mongoose = require('mongoose');

const DrawingSchema = new mongoose.Schema({
    pdf: { type: mongoose.Schema.Types.ObjectId, ref: 'PDF', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pageNumber: { type: Number, required: true },
    color: { type: String, default: '#000000' },
    lineWidth: { type: Number, default: 2 },

    shape: { type: String, required: true, default: 'freehand' },

    path: [{ x: Number, y: Number }],

    startX: { type: Number },
    startY: { type: Number },
    endX: { type: Number },
    endY: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('Drawing', DrawingSchema);