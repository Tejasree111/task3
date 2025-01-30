const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const routes = require('./v1/routes'); // Import routes from v1
const { decryptMiddleware, encryptMiddleware } = require('./../src/middleware/cryptoMiddleware');

const server = express();

server.use(cors());
server.use(bodyParser.json());
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 150, // Limit each IP to 150 requests per `windowMs`
  message: {
    status: 429,
    message: "Too many requests, please try again later.",
  },
});

server.use('/api/v1',limiter);

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