
const express = require('express');
const router = express.Router();
const productController = require('./product.controller');

// Define the route for fetching products
router.get('/products', productController.getProducts);

module.exports = router;
