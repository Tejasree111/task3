const express = require('express');
const router = express.Router();
const importController = require('./import.controller');

// Route for importing data
router.post('/import', importController.importData);

module.exports = router;
