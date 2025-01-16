/*const express = require('express');
const router = express.Router();
const authRoutes = require('./auth/auth.routes');
const profileRoutes = require('./profile/profile.routes');
const { authenticateUser } = require('../middleware/auth.middleware');

router.use('/auth', authRoutes);
router.use('/profile', authenticateUser, profileRoutes);
module.exports = router;
*/
const express = require('express');
const router = express.Router();
const authRoutes = require('./auth/auth.routes');
const profileRoutes = require('./profile/profile.routes');
const productRoutes = require('./product/product.routes');
const { authenticateUser } = require('../middleware/auth.middleware');

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/profile', authenticateUser, profileRoutes);
router.use('/products', authenticateUser, productRoutes);

module.exports = router;

