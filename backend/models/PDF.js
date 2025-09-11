const mongoose = require('mongoose');

const pdfSchema = new mongoose.Schema({
  uuid: {
    type: String,
    required: true,
    unique: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  size: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PDF', pdfSchema);