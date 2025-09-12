const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DrawingSchema = new Schema({
    pdf: {
        type: Schema.Types.ObjectId,
        ref: 'PDF',
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    pageNumber: {
        type: Number,
        required: true,
    },
    // The 'path' will store an array of coordinate objects for the drawing
    path: [{
        x: Number,
        y: Number,
    }],
    color: {
        type: String,
        default: '#000000', // Default to black
    },
    lineWidth: {
        type: Number,
        default: 2, // Default line width
    },
}, { timestamps: true });

module.exports = mongoose.model('Drawing', DrawingSchema);