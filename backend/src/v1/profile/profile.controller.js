/*const sharp = require('sharp');
const s3 = require('../../aws/s3/s3.config');
const profileQueries = require('./profile.queries');

const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
  };

  const data = await s3.upload(params).promise();
  return data.Location; // Returns the public URL of the uploaded file
};

const uploadProfilePicture = async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: User ID missing' });
  }

  try {
    const fileNameBase = `${userId}_${Date.now()}`;
    const profilePicName = `${fileNameBase}_profile.jpg`;
    const thumbnailName = `${fileNameBase}_thumbnail.jpg`;

    // Resize profile picture (400x400)
    const profilePicBuffer = await sharp(file.buffer)
      .resize(400, 400)
      .jpeg({ quality: 80 })
      .toBuffer();

    // Resize thumbnail (60x60)
    const thumbnailBuffer = await sharp(file.buffer)
      .resize(60, 60)
      .jpeg({ quality: 80 })
      .toBuffer();

    // Upload both images to S3
    const profilePicUrl = await uploadToS3(profilePicBuffer, profilePicName, file.mimetype);
    const thumbnailUrl = await uploadToS3(thumbnailBuffer, thumbnailName, file.mimetype);

    // Update the database with the image URLs
    await profileQueries.updateUserProfilePicture(userId, profilePicUrl, thumbnailUrl);

    res.status(200).json({
      message: 'Profile picture uploaded successfully',
      profilePicUrl,
      thumbnailUrl,
    });
  } catch (err) {
    console.error('Error uploading profile picture:', err);
    res.status(500).json({ error: 'Error uploading profile picture' });
  }
};

module.exports = { uploadProfilePicture };*/


// profile.controller.js
const sharp = require('sharp');
const s3 = require('../../aws/s3/s3.config');
const profileQueries = require('./profile.queries');

const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
  };

  const data = await s3.upload(params).promise();
  return data.Location; // Returns the public URL of the uploaded file
};

const uploadProfilePicture = async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: User ID missing' });
  }

  try {
    const fileNameBase = `${userId}_${Date.now()}`;
    const profilePicName = `${fileNameBase}_profile.jpg`;
    const thumbnailName = `${fileNameBase}_thumbnail.jpg`;

    // Resize profile picture (400x400)
    const profilePicBuffer = await sharp(file.buffer)
      .resize(400, 400)
      .jpeg({ quality: 80 })
      .toBuffer();

    // Resize thumbnail (60x60)
    const thumbnailBuffer = await sharp(file.buffer)
      .resize(60, 60)
      .jpeg({ quality: 80 })
      .toBuffer();

    // Upload both images to S3
    const profilePicUrl = await uploadToS3(profilePicBuffer, profilePicName, file.mimetype);
    const thumbnailUrl = await uploadToS3(thumbnailBuffer, thumbnailName, file.mimetype);

    // Update the database with the image URLs
    await profileQueries.updateUserProfilePicture(userId, profilePicUrl, thumbnailUrl);

    res.status(200).json({
      message: 'Profile picture uploaded successfully',
      profilePicUrl,
      thumbnailUrl,
    });
  } catch (err) {
    console.error('Error uploading profile picture:', err);
    res.status(500).json({ error: 'Error uploading profile picture' });
  }
};


const uploadProductPicture = async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: User ID missing' });
  }

  try {
    const fileNameBase = `${userId}_${Date.now()}`;
    const profilePicName = `${fileNameBase}_profile.jpg`;
    const thumbnailName = `${fileNameBase}_thumbnail.jpg`;

    // Resize profile picture (400x400)
    const profilePicBuffer = await sharp(file.buffer)
      .resize(400, 400)
      .jpeg({ quality: 80 })
      .toBuffer();

    // Resize thumbnail (60x60)
    const thumbnailBuffer = await sharp(file.buffer)
      .resize(60, 60)
      .jpeg({ quality: 80 })
      .toBuffer();

    // Upload both images to S3
    const profilePicUrl = await uploadToS3(profilePicBuffer, profilePicName, file.mimetype);
    const thumbnailUrl = await uploadToS3(thumbnailBuffer, thumbnailName, file.mimetype);

    // Update the database with the image URLs

    res.status(200).json({
      message: 'Profile picture uploaded successfully',
      profilePicUrl,
      thumbnailUrl,
    });
  } catch (err) {
    console.error('Error uploading profile picture:', err);
    res.status(500).json({ error: 'Error uploading profile picture' });
  }
};

module.exports = { uploadProfilePicture , uploadProductPicture};

