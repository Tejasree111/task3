const express = require('express');
const router = express.Router();
const authRoutes = require('./auth/auth.routes');
const profileRoutes = require('./profile/profile.routes');
const productRoutes = require('./product/product.routes');
const uploadRoutes = require('./upload/upload.routes');
const importRoutes =require('./import/import.routes');
const { authenticateUser } = require('../middleware/auth.middleware');

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/profile', authenticateUser, profileRoutes);
router.use('/products', authenticateUser, productRoutes);
router.use('/uploads',authenticateUser,importRoutes);
router.use('/upload', authenticateUser, uploadRoutes);
router.use('/files',authenticateUser,importRoutes);

module.exports = router;

