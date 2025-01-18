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
  return data.Location;
};

const uploadProfilePicture = async (req, res) => {
  const file = req.file;
  const userId = req.user?.id;

  if (!file || !userId) return res.status(400).json({ error: 'File or User ID missing' });

  try {
    const fileNameBase = `${userId}_${Date.now()}`;
    const profilePicName = `${fileNameBase}_profile.jpg`;
    const thumbnailName = `${fileNameBase}_thumbnail.jpg`;

    const profilePicBuffer = await sharp(file.buffer).resize(400, 400).jpeg({ quality: 80 }).toBuffer();
    const thumbnailBuffer = await sharp(file.buffer).resize(60, 60).jpeg({ quality: 80 }).toBuffer();

    const profilePicUrl = await uploadToS3(profilePicBuffer, profilePicName, file.mimetype);
    const thumbnailUrl = await uploadToS3(thumbnailBuffer, thumbnailName, file.mimetype);

    await profileQueries.updateUserProfilePicture(userId, profilePicUrl, thumbnailUrl);

    res.status(200).json({ message: 'Profile picture uploaded successfully', profilePicUrl, thumbnailUrl });
  } catch (err) {
    res.status(500).json({ error: 'Error uploading profile picture' });
  }
};

const uploadProductPicture = async (req, res) => {
  const file = req.file;
  const userId = req.user?.id;

  if (!file || !userId) return res.status(400).json({ error: 'File or User ID missing' });

  try {
    const fileNameBase = `${userId}_${Date.now()}`;
    const productPicName = `${fileNameBase}_product.jpg`;

    const productPicBuffer = await sharp(file.buffer).resize(400, 400).jpeg({ quality: 80 }).toBuffer();
    const productPicUrl = await uploadToS3(productPicBuffer, productPicName, file.mimetype);

    res.status(200).json({ message: 'Product picture uploaded successfully', productPicUrl });
  } catch (err) {
    res.status(500).json({ error: 'Error uploading product picture' });
  }
};

module.exports = { uploadProfilePicture, uploadProductPicture };

