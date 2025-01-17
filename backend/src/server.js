const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./v1/routes'); // Import routes from v1

const server = express();

server.use(cors());
server.use(bodyParser.json());

// Mount routes under '/api/v1'
server.use('/api/v1', routes);

server.listen(3000, () => {
  console.log('Server started on port 3000');
});
