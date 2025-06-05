const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  villaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Villa',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    default: 2
  },
  amenities: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Room', roomSchema);
