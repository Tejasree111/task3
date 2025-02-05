/*const express = require('express');
const router = express.Router();
const importController = require('./import.controller');

// Route for importing data
router.post('/import', importController.importData);

module.exports = router;
*/
// src/v1/import/import.routes.js

const express = require('express');
const router = express.Router();
const importController = require('./import.controller');
const multer = require('multer');


const upload = multer({ storage: multer.memoryStorage() });

router.post('/import', upload.array('files', 10), importController.importData);
router.get('/uploads', importController.getUserUploads);  
module.exports = router;
