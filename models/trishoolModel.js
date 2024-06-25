const mongoose = require('mongoose');

const TrishoolSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
  },{ timestamps: true});

const Trishool = mongoose.model('Trishool', TrishoolSchema);
module.exports = Trishool;
