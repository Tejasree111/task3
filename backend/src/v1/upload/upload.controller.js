// backend/src/v1/upload/upload.controller.js

const jwt = require('jsonwebtoken');
const sharp = require('sharp');
const s3 = require('../../aws/s3/s3.config'); 
const { zipFiles } = require('./zipUtils'); 

const uploadToS3 = async (fileBuffer, fileName, mimeType,userId) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `tejasree@AKV0771/${userId}/${fileName}`,
    Body: fileBuffer,
    ContentType: mimeType,
  };
  const data = await s3.upload(params).promise();
  return data.Location; // URL of the uploaded file
};

const uploadFile = async (req, res) => {
  const file = req.file;
  const token = req.headers['authorization'];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  const userId = req.user.id;

  if (!file || !userId) {
    return res.status(400).json({ error: 'File or User ID missing' });
  }

  try {
    const fileName = `${userId}_${Date.now()}_${file.originalname}`;
    let fileBuffer;

    if (file.mimetype.startsWith('image/')) {
      // Handle image files with sharp
      fileBuffer = await sharp(file.buffer).resize(800, 800).toBuffer();
    } else if (file.mimetype === 'application/pdf') {
      // Handle PDF files (just upload the PDF as is)
      fileBuffer = file.buffer;
    } else if (
      file.mimetype === 'application/vnd.ms-excel' || // For .xls
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // For .xlsx
    ) {
      // Handle Excel files (upload as is)
      fileBuffer = file.buffer;
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    const fileUrl = await uploadToS3(fileBuffer, fileName, file.mimetype, userId);

    res.status(200).json({ message: 'File uploaded successfully', fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error uploading file' });
  }
};

// Fetch uploaded files for a specific user from S3
const getUploadedFiles = async (req, res) => {
  const token = req.headers['authorization'];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  const userId = req.user.id;
    console.log("userrrrrrrrrrrrrrrrrrrrrrrrrr",userId);
  if (!userId) return res.status(400).json({ error: 'User not authenticated' });

  const prefix = `tejasree@AKV0771/${userId}/`; // Prefix for the user-specific folder in S3 (Make sure each user has their own folder)

  try {
    const data = await s3.listObjectsV2({ Bucket: process.env.AWS_BUCKET_NAME, Prefix: prefix }).promise();

    // Only include files within the user's folder
    const files = data.Contents.map(file => ({
      name: file.Key.split('/').pop(), // Extract file name from the full S3 key
      url: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${file.Key}`, // Generate the public URL for the file
    }));
    console.log(files);
    res.status(200).json({ files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching files' });
  }
};

const downloadFiles = async (req, res) => {
  const { fileNames } = req.body; // Array of selected file names
  const userId = req.user.id; // Extract userId from JWT token
  if (!userId) return res.status(400).json({ error: 'User not authenticated' });

  try {
    // If only one file is selected, send it directly
    if (fileNames.length === 1) {
      const fileName = fileNames[0];
      const fileKey = `tejasree@AKV0771/${userId}/${fileName}`; // Ensure the file is in the user's folder
      const fileData = await s3.getObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: fileKey }).promise();
      
      res.set('Content-Type', fileData.ContentType);
      res.set('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(fileData.Body);
    }

    const filesToDownload = [];
    for (const fileName of fileNames) {
      const fileKey = `tejasree@AKV0771/${userId}/${fileName}`;
      const fileData = await s3.getObject({ Bucket: process.env.AWS_BUCKET_NAME, Key: fileKey }).promise();
      filesToDownload.push({ name: fileName, data: fileData.Body });
    }

    const zipBuffer = await zipFiles(filesToDownload);
    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', 'attachment; filename="files.zip"');
    res.send(zipBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error downloading files' });
  }
};


module.exports = { uploadFile, getUploadedFiles, downloadFiles };
