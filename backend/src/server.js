const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./v1/routes');
const jwt = require('jsonwebtoken');
const productRoutes = require('../src/v1/product/product.routes');

server.use(cors());
server.use(bodyParser.json());

server.use('/api', productRoutes);

// Use the routes
server.use('/api/v1', routes);

server.listen(3000, () => {
    console.log('Server started on port 3000');
});