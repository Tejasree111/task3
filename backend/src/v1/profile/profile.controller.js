const jwt = require('jsonwebtoken');
const sharp = require('sharp');
const s3 = require('../../aws/s3/s3.config');
const profileQueries = require('./profile.queries');
const db=require('../../mysql/connection');


const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `tejasree@AKV0771/${fileName}`,
    Body: fileBuffer,
    ContentType: mimeType,
  };
  const data = await s3.upload(params).promise();
  return data.Location;
};

const uploadProfilePicture = async (req, res) => {
  const file = req.file;
  const token = req.headers['authorization'];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  const userId = req.user.id;
  console.log(userId);

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
    console.log("product pic url",productPicUrl);
    res.status(200).json({ message: 'Product picture uploaded successfully', productPicUrl });
  } catch (err) {
    res.status(500).json({ error: 'Error uploading product picture' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    console.log("req.user:", req.user);
    console.log("req.user.id:", req.user.id);

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    // Ensure role_id & branch_id are fetched if missing
    if (!req.user.role_id || !req.user.branch_id) {
      const user = await db('users')
        .select('role_id', 'branch_id')
        .where({ user_id: req.user.id })
        .first();

      if (!user) {
        return res.status(403).json({ message: "Access denied: User not found" });
      }

      req.user.role_id = user.role_id;
      req.user.branch_id = user.branch_id;
    }

    // Check if user is an admin
    if (req.user.role_id !== 1) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    // Fetch users with role names
    const users = await db('users')
      .leftJoin('roles', 'users.role_id', 'roles.role_id')
      .select(
        'users.user_id',
        'users.first_name',
        'users.last_name',
        'users.email',
        'users.username',
        'users.role_id',
        'roles.role_name' // Get role name from roles table
      );

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user details
const updateUser = async (req, res) => {
  const { user_id } = req.params;
  const { first_name, last_name, email, username, role_id } = req.body;

  try {
    await db('users')
      .where({ user_id })
      .update({ first_name, last_name, email, username, role_id });

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all roles
const getRoles = async (req, res) => {
  try {
    const roles = await db('roles').select('role_id', 'role_name');
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { uploadProfilePicture, uploadProductPicture,getAllUsers,updateUser,getRoles};

