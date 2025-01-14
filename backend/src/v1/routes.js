const express = require('express');
const router = express.Router();
const authRoutes = require('./auth/auth.routes');
const profileRoutes = require('./profile/profile.routes');
const { authenticateUser } = require('../middleware/auth.middleware');

router.use('/auth', authRoutes);
router.use('/profile', authenticateUser, profileRoutes);
module.exports = router;