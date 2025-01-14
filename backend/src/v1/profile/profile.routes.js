/*const express = require('express');
const multer = require('multer');
const path = require('path');
const profileController = require('./profile.controller');

// Multer configuration for file uploads
const upload = multer({
    dest: path.join(__dirname, '../../uploads/temp'), // Temporary folder
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

const router = express.Router();

// Route for uploading profile picture
router.post('/upload-profile', upload.single('profileImage'), profileController.uploadProfilePicture);

module.exports = router;*/
// src/routes/profile.routes.js
const express = require('express');
const multer = require('multer');
const profileController = require('./profile.controller');

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.post('/upload-profile', upload.single('profileImage'), profileController.uploadProfilePicture);

module.exports = router;
