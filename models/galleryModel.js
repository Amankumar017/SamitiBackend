const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  event: {
    type: String,
    required: true
  },
  images: [
    {
      type: String,
      required: true
    }
  ]
},{ timestamps: true});

const Gallery = mongoose.model('Gallery', GallerySchema);
module.exports = Gallery;
