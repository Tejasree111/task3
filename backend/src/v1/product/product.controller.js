const productQueries = require('./product.queries');
const knexConfig = require('../../mysql/knexfile'); // Import knex configuration
const knex = require('knex')(knexConfig.development); // Initialize knex with the configuration
// Fetch all products
/*const getProducts = async (req, res) => {
  try {
    const products = await productQueries.getAllProducts();
    console.log(products);
    res.status(200).json(products); // Send the products as a response
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error retrieving products', error });
  }
};

module.exports = {
  getProducts,
};
*/

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
/*
const addProduct = async (req, res) => {
  try {
    const { product_name, category_id, vendor_id, quantity_in_stock, unit_price, status, product_image } = req.body;
    
    const [newProduct] = await knex('products').insert({
      product_name,
      category_id,
      vendor_id,
      quantity_in_stock,
      unit_price,
      status,
      product_image,
    }).returning('*');
    
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Error adding product', error });
  }
};*/
// 


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
  //addProduct,
  updateProductStatus,
};