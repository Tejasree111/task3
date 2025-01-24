const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./v1/routes'); // Import routes from v1
const { decryptMiddleware, encryptMiddleware } = require('./../src/middleware/cryptoMiddleware');

const server = express();

server.use(cors());
server.use(bodyParser.json());
server.use(decryptMiddleware);
// Mount routes under '/api/v1'
server.use('/api/v1', routes);
// Encrypt all outgoing responses
server.use(encryptMiddleware);

// Global Error Handler
server.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

server.listen(3000, () => {
  console.log('Server started on port 3000');
});