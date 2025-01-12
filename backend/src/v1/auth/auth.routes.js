const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

router.post('/signup', authController.signup);

router.post('/login', authController.login);

router.get('/profile', authController.getProfile);
module.exports = router;