/*const productQueries = require('./product.queries');
const knexConfig = require('../../mysql/knexfile'); // Import knex configuration
const knex = require('knex')(knexConfig.development); // Initialize knex with the configuration

const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Get pagination parameters
    const offset = (page - 1) * limit;

    const [products, total] = await Promise.all([
      productQueries.getAllProducts(parseInt(limit), parseInt(offset)),
      productQueries.getProductCount(),
    ]);


    console.log("Products: ", products);

    res.status(200).json({
      products,
      total: total[0].total,
      page: parseInt(page),
      totalPages: Math.ceil(total[0].total / limit),
    });
  } catch (error) {
    console.error('Error retrieving products:', error);
    res.status(500).json({ message: 'Error retrieving products', error });
  }
};

const getVendorsAndCategories = async (req, res) => {
  try {
    const [vendors, categories] = await Promise.all([
      productQueries.getAllVendors(),
      productQueries.getAllCategories(),
    ]);
    
    res.status(200).json({
      vendors,
      categories,
    });
  } catch (error) {
    console.error('Error retrieving vendors and categories:', error);
    res.status(500).json({ message: 'Error retrieving vendors and categories', error });
  }
};

const updateProductStatus = async (req, res) => {
  console.log(req.params);
  const { productId } = req.params;
  const status = "99"; // Status for soft delete

  try {
    // Update the product status to 99
    const result = await knex('products')
      .where('product_id', productId)
      .update({ status });

    if (result === 0) {
      // If no rows were updated, the product doesn't exist
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product status updated successfully' });
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({ message: 'Failed to update product status' });
  }
};


module.exports = {
  getProducts,
  getVendorsAndCategories,
  updateProductStatus,
};*/
const productQueries = require('./product.queries');
const knexConfig = require('../../mysql/knexfile'); // Import knex configuration
const knex = require('knex')(knexConfig.development);
/*
const getProducts = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const products = await productQueries.getAllProducts(limit, offset);
    const total = await productQueries.getProductCount();

    res.status(200).json({
      products,
      total: total[0].total,
      page: parseInt(page),
      totalPages: Math.ceil(total[0].total / limit),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving products' });
  }
};*/

const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Get pagination parameters
    const offset = (page - 1) * limit;

    const [products, total] = await Promise.all([
      productQueries.getAllProducts(parseInt(limit), parseInt(offset)),
      productQueries.getProductCount(),
    ]);


    console.log("Products: ", products);

    res.status(200).json({
      products,
      total: total[0].total,
      page: parseInt(page),
      totalPages: Math.ceil(total[0].total / limit),
    });
  } catch (error) {
    console.error('Error retrieving products:', error);
    res.status(500).json({ message: 'Error retrieving products', error });
  }
};

/*
const getVendorsAndCategories = async (req, res) => {
  try {
    const vendors = await productQueries.getAllVendors();
    const categories = await productQueries.getAllCategories();
    res.status(200).json({ vendors, categories });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving vendors and categories' });
  }
};*/


const getVendorsAndCategories = async (req, res) => {
  try {
    const [vendors, categories] = await Promise.all([
      productQueries.getAllVendors(),
      productQueries.getAllCategories(),
    ]);
    
    res.status(200).json({
      vendors,
      categories,
    });
  } catch (error) {
    console.error('Error retrieving vendors and categories:', error);
    res.status(500).json({ message: 'Error retrieving vendors and categories', error });
  }
};
/*
const updateProductStatus = async (req, res) => {
  const { productId } = req.params;
  const status = "99"; // Soft delete status

  try {
    const result = await productQueries.updateProductStatus(productId, status);
    if (result === 0) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({ message: 'Product status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating product status' });
  }
};*/

const updateProductStatus = async (req, res) => {
  console.log(req.params);
  const { productId } = req.params;
  const status = "99"; // Status for soft delete

  try {
    // Update the product status to 99
    const result = await knex('products')
      .where('product_id', productId)
      .update({ status });

    if (result === 0) {
      // If no rows were updated, the product doesn't exist
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product status updated successfully' });
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({ message: 'Failed to update product status' });
  }
};

/*
const addProduct = async (req, res) => {
  const { productData, selectedImage } = req.body;

  try {
    const newProduct = await productQueries.addProduct(productData, selectedImage);
    res.status(201).json({ product_id: newProduct });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add product' });
  }
};*/

const addProduct = async (req, res) => {
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
}

module.exports = { getProducts, getVendorsAndCategories, updateProductStatus, addProduct };
