/*const express = require('express');
const router = express.Router();
const knexConfig = require('../../mysql/knexfile'); // Import knex configuration
const knex = require('knex')(knexConfig.development); // Initialize knex with the configuration

// Define product routes
const productController = require('./product.controller'); 

// GET routes for getting products, categories, and vendors
router.get('/products', productController.getProducts);
router.get('/vendors-and-categories', productController.getVendorsAndCategories);

// Define route for soft delete
router.put('/:productId/status', productController.updateProductStatus);


// POST route for adding a new product
router.post('/add', async (req, res) => {
  const {
    productData,selectedImage
  } = req.body;
  
  const trx = await knex.transaction();

  try {
    // Insert product into the products table
    const [newProduct] = await trx('products').insert({
      product_name: productData.productName,
      category_id: productData.category,
      quantity_in_stock: productData.quantity,
      unit_price: productData.unit,
      product_image: selectedImage==null?'':selectedImage, // Handle null or empty image paths
      status: productData.status // Default to active if not provided
    });

    // Now, retrieve the new product_id from the products table
    const productId = newProduct; // This will hold the inserted product_id.

    // Insert product-to-vendor relation into the product_to_vendor table
    await trx('product_to_vendor').insert({
      product_id: productId, // Use the product_id from the newly inserted product
      vendor_id: productData.vendor,
      status: '1' // Set as active
    });

    // Commit the transaction
    await trx.commit();

    // Return the newly added product with the associated vendor
    res.status(201).json({
      product_id: productId, // You can return the product_id
    });

  } catch (error) {
    // If any error occurs, rollback the transaction
    await trx.rollback();
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

module.exports = router;*/
const express = require('express');
const router = express.Router();
const productController = require('./product.controller');

router.get('/', productController.getProducts);
router.get('/vendors-and-categories', productController.getVendorsAndCategories);
router.put('/:productId/status', productController.updateProductStatus);
router.post('/add', productController.addProduct);

module.exports = router;
