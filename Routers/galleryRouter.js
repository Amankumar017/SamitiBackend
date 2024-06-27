const express = require('express');
const Router = express.Router();
const Gallery = require('../models/galleryModel');
const authenticateUser = require('../middleware/authenticateUser');
const { uploadOnCloudinary } = require('../cloudinary');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'galleryUploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extname = path.extname(file.originalname);
    const newFileName =file.fieldname + '-' + uniqueSuffix + extname;
    cb(null, newFileName); // Use a unique filename for each uploaded file
  }
});

const upload = multer({ storage: storage });

Router.get('/gallery',async(req,res) => {
  try {
      const gallery = await Gallery.find().sort({ createdAt: -1 });
      res.status(200).json(gallery);
  } catch (err) {
      console.error('Error fetching books:', err);
      res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to handle gallery uploads
// Router.post('/upload-gallery', authenticateUser,upload.array('images'), async (req, res) => {
//     try {
//       const { event } = req.body;
//       const imageUrls = req.files.map(file => file.path);
//       console.log({imageUrls});

//       const newEvent = new Gallery({
//         event,
//         images: imageUrls
//       });
  
//       await newEvent.save();
//       res.status(201).json(newEvent);
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to upload images' });
//     }
// });

Router.post('/upload-gallery', authenticateUser, upload.array('images'), async (req, res) => {
  try {
    const { event } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const uploadPromises = files.map(file => uploadOnCloudinary(file.path));

    const uploadResponses = await Promise.all(uploadPromises);
    const imageUrls = uploadResponses.map(response => response.url);

    console.log({ imageUrls });

    const newEvent = new Gallery({
      event,
      images: imageUrls
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload images' });
  }
});
  
  module.exports = Router;