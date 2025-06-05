const mongoose = require('mongoose');

const villaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: String,
  description: String,
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Villa', villaSchema);
