const mongoose = require('mongoose');

const highlightSchema = new mongoose.Schema({
  pdf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PDF',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pageNumber: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  position: {
    type: {
      x: Number,
      y: Number,
      width: Number,
      height: Number
    },
    required: true
  },
  color: {
    type: String,
    default: '#ffeb3b'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Highlight', highlightSchema);