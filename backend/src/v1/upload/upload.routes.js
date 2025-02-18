const express = require('express');
const multer = require('multer');
const { uploadFile, getUploadedFiles, downloadFiles } = require('./upload.controller');
const upload = multer();
const {authorize} = require('../../middleware/auth.middleware');
const router = express.Router();
// Route for uploading a file
router.post('/upload',authorize(1),upload.single('file'), uploadFile);

// Route to get the list of uploaded files
router.get('/files', getUploadedFiles);

// Route to download selected files as a zip
router.post('/download', downloadFiles);

module.exports = router;
