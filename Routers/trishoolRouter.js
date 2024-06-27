const express = require('express');
const Router = express.Router();
const multer = require('multer');
const Trishool = require('../models/trishoolModel');
const sharp = require('sharp');
const path = require('path');
const authenticateUser = require('../middleware/authenticateUser');
const { uploadOnCloudinary } = require('../cloudinary');
const https = require('https');
Router.use(express.urlencoded({ extended: false }));


// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'trishoolUploads/');  // Destination directory
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extname = '.' + file.originalname.split('.').pop(); // Get file extension
        const newFileName = file.fieldname + '-' + uniqueSuffix + extname; // Construct filename
        cb(null, newFileName); // Use a unique filename for each uploaded file
    },
});

// Multer file filter
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true); // Accept PDF files
    } else {
        cb(new Error('Only PDF files are allowed'), false); // Reject non-PDF files
    }
};

// Multer upload configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

// Fetch trishools
Router.get('/trishools', async (req, res) => {
    try {
        const trishools = await Trishool.find().sort({ createdAt: -1 });
        res.status(200).json(trishools); // Respond with fetched trishools
    } catch (err) {
        console.error('Error fetching trishools:', err);
        res.status(500).json({ message: 'Internal server error' }); // Server error response
    }
});

// Upload trishool
Router.post('/uploadTrishool',authenticateUser,upload.single('TrishoolFile'), async (req, res) => {
    try {
        const { title, content } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Trishool file is required' });
        }

        const {secure_url:fileUrl} = await uploadOnCloudinary(file.path); // Uploaded file path
        console.log({fileUrl});
        if (!title || !content) {
            // Validate title and content
            return res.status(400).json({ message: 'Title and content are required fields' });
        }

        const trishool = new Trishool({
            title,
            content,
            fileUrl,
        });

        const newTrishool = await trishool.save(); // Save trishool to database
        res.status(201).json(newTrishool); // Respond with saved trishool
    } catch (err) {
        console.error('Error uploading trishool:', err);
        res.status(500).json({ message: 'Internal server error' }); // Server error response
    }
});

Router.get('/trishools/:id/download', authenticateUser, async (req, res) => {
    try {
        const trishool = await Trishool.findById(req.params.id);

        if (!trishool) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const fileUrl = trishool.fileUrl;
        console.log({ fileUrl });

        https.get(fileUrl, (response) => {
            if (response.statusCode !== 200) {
                return res.status(response.statusCode).json({ message: `Failed to fetch file: ${response.statusMessage}` });
            }

            // Sanitize and encode the filename
            const encodedFilename = encodeURIComponent(trishool.title) + '.pdf';

            // Set headers to prompt a file download
            res.setHeader('Content-Length', response.headers['content-length']);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${encodedFilename}"`);

            // Pipe the response stream to the client
            response.pipe(res);
        }).on('error', (err) => {
            console.error('Error fetching file:', err);
            res.status(500).json({ message: 'Internal server error' });
        });
    } catch (err) {
        console.error('Error downloading book:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = Router;
