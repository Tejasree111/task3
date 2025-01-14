const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authenticateUser } = require('../../middleware/auth.middleware');

router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.get('/profile', authenticateUser, authController.getProfile);
module.exports = router;