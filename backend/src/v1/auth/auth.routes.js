
const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh-token', authController.refreshAccessToken);
router.get('/profile', authController.getProfile);

module.exports = router;