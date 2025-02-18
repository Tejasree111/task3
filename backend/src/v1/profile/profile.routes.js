const express = require('express');
const router = express.Router();
const profileController = require('./profile.controller');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-profile', upload.single('profileImage'), profileController.uploadProfilePicture);

router.post('/upload-product', upload.single('productImage'), profileController.uploadProductPicture);
router.get('/all', profileController.getAllUsers);
router.put('/:user_id',profileController.updateUser);
router.get('/roles', profileController.getRoles);

module.exports = router;
