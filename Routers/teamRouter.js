const express = require('express');
const Router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const Team = require('../models/teamModel');
const authenticateUser = require('../middleware/authenticateUser');
const { uploadOnCloudinary } = require('../cloudinary');

Router.use(express.urlencoded({ extended: false }));


// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'teamUploads/');  // Destination directory
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extname = '.' + file.originalname.split('.').pop(); // Get file extension
        const newFileName = file.fieldname + '-' + uniqueSuffix + extname; // Construct filename
        cb(null, newFileName); // Use a unique filename for each uploaded file
    },
});

// Multer upload configuration
const upload = multer({storage: storage});

// Fetch trishools
Router.get('/team', async (req, res) => {
    try {
        const trishools = await Team.find();
        res.status(200).json(trishools); // Respond with fetched trishools
    } catch (err) {
        console.error('Error fetching trishools:', err);
        res.status(500).json({ message: 'Internal server error' }); // Server error response
    }
});

Router.post('/add-member',authenticateUser, upload.single('picture'), async (req, res) => {
    try {
      const { name, rollNo, passingYear } = req.body;
      // console.log({name,rollNo,passingYear});
      if (!name || !rollNo || !passingYear) {
        // Validate name, rollNo, and passingYear
        return res.status(400).json({ message: 'name, rollNo, and passingYear are required fields' });
      }

      const file = req.file;
  
      if (!file) {
        return res.status(400).json({ message: 'picture file is required' });
      }

      const { url:picture }= await uploadOnCloudinary(file.path);
  
      // Check if the member already exists based on rollNo and passingYear
      let existingMember = await Team.findOne({rollNo});
  
      if (existingMember) {
        // Update existing member
        existingMember.name = name;
        existingMember.picture = picture;
  
        const updatedMember = await existingMember.save();
        return res.status(200).json(updatedMember); // Respond with updated member
      } else {
        // Create new member if not exists
        const team = new Team({
          name,
          rollNo,
          passingYear,
          picture,
        });
  
        const newMember = await team.save(); // Save member to database
        return res.status(201).json(newMember); // Respond with saved member
      }
    } catch (err) {
      console.error('Error adding or updating member:', err);
      res.status(500).json({ message: 'Internal server error' }); // Server error response
    }
});

module.exports = Router;
