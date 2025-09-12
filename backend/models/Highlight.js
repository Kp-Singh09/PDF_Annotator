const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
    x1: Number, y1: Number,
    x2: Number, y2: Number,
    width: Number, height: Number,
}, { _id: false });

const HighlightSchema = new mongoose.Schema({
    pdf: { type: mongoose.Schema.Types.ObjectId, ref: 'PDF', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    position: [positionSchema],
    pageNumber: { type: Number, required: true },
    color: { type: String, default: 'rgba(255, 255, 0, 0.4)' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Highlight', HighlightSchema);