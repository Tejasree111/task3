// src/controllers/profile.controller.js
const sharp = require('sharp');
const s3 = require('../../aws/s3/s3.config');
const profileQueries = require('./profile.queries');

const uploadToS3 = async (filePath, fileName, mimeType) => {
    const fileContent = await sharp(filePath).toBuffer();

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: fileContent,
        ContentType: mimeType,
        //ACL: 'public-read', // Make the file publicly readable
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

        // Resize and upload profile picture
        await sharp(file.path).resize(400, 400).toFile(`${file.path}_profile.jpg`);
        const profilePicUrl = await uploadToS3(file.path, profilePicName, file.mimetype);

        // Resize and upload thumbnail
        await sharp(file.path).resize(60, 60).toFile(`${file.path}_thumbnail.jpg`);
        const thumbnailUrl = await uploadToS3(file.path, thumbnailName, file.mimetype);

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

module.exports = { uploadProfilePicture };
