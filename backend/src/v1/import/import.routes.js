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
const { authorize} = require('../../middleware/auth.middleware');

router.post('/import',authorize(1), upload.array('files', 10), importController.importData);

router.get('/uploads', importController.getUserUploads);  
module.exports = router;
