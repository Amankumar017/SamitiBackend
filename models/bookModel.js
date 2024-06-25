const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    coverUrl: {
      type: String,
      default: 'uploads/default-cover.png'
    },
  },{ timestamps: true});

const Book = mongoose.model('Book', BookSchema);
module.exports = Book;
