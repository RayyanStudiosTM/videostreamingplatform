const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'completed', 'failed'],
    default: 'uploading'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  sensitivity: {
    type: String,
    enum: ['safe', 'flagged', null],
    default: null
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Video', VideoSchema);