const express = require('express');
const Router = express.Router();
const multer = require('multer');
const authenticateUser = require('../middleware/authenticateUser');
const Book = require('../models/bookModel');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

Router.use(express.urlencoded({ extended: false }));

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = file.fieldname === 'file' ? 'bookUploads/' : 'coverUploads/';
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extname = path.extname(file.originalname);
        const newFileName = file.fieldname + '-' + uniqueSuffix + extname;
        cb(null, newFileName); // Use a unique filename for each uploaded file
    },
});

// Multer file filter
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'file' && file.mimetype === 'application/pdf') {
        cb(null, true);
    } else if (file.fieldname === 'coverImage' && file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files and images are allowed'));
    }
};

// Multer upload configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

// Handle GET request for all books
Router.get('/books', async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 });
        res.status(200).json(books);
    } catch (err) {
        console.error('Error fetching books:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Handle POST request to upload book and cover image
Router.post('/uploadBook', authenticateUser , upload.fields([{ name: 'file', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), async (req, res) => {
    try {
        const { name, author } = req.body;
        const file = req.files['file'] ? req.files['file'][0] : null;
        const coverImage = req.files['coverImage'] ? req.files['coverImage'][0] : null;

        if (!file || !coverImage) {
            return res.status(400).json({ message: 'Book file and cover image are required' });
        }

        const fileUrl = file.path;
        const coverUrl = coverImage.path;

        if (!name || !author) {
            return res.status(400).json({ message: 'Name and author are required fields' });
        }

        const book = new Book({
            name,
            author,
            fileUrl,
            coverUrl
        });

        const newBook = await book.save();
        res.status(201).json(newBook);
    } catch (err) {
        console.error('Error uploading book:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Route to download a book PDF
Router.get('/books/:id/download', authenticateUser, async (req, res) => {
    try {
      const book = await Book.findById(req.params.id);
  
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
  
      const filePath = 'https://samitibackend.onrender.com/' + book.fileUrl.replace(/\\/g, '/');
      // console.log({filePath});
      const stat = fs.statSync(filePath);
      // console.log({stat});

      const encodedFilename = encodeURIComponent(book.name) + '.pdf';
  
      // Set headers to prompt a file download
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${encodedFilename}"`);
  
      // Create a read stream for the file and pipe it to the response
      const fileStream = fs.createReadStream(filePath);
      fileStream.on('error', (error) => {
        console.error('Error reading file:', error);
        res.status(500).json({ message: 'Internal server error' });
      });
  
      fileStream.pipe(res);
  
    //   console.log(`Book downloaded: ${book.name} by ${book.author}`);
    } catch (err) {
      console.error('Error downloading book:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = Router;
