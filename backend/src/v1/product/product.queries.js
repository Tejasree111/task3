const knexConfig = require('../../mysql/knexfile'); // Import knex configuration
const knex = require('knex')(knexConfig.development); // Initialize knex with the configuration

const getAllProducts = () => {
  return knex('products')
    .join('categories', 'products.category_id', '=', 'categories.category_id') // Join products with categories table
    .join('product_to_vendor', 'products.product_id', '=', 'product_to_vendor.product_id') // Join with product_to_vendor table
    .join('vendors', 'product_to_vendor.vendor_id', '=', 'vendors.vendor_id') // Join with vendors table
    .select(
      'products.product_id',
      'products.product_name',
      'categories.category_name',
      knex.raw('GROUP_CONCAT(vendors.vendor_name) AS vendors'), // Concatenate vendor names
      'products.quantity_in_stock',
      'products.unit_price',
      'products.product_image',
      'products.status'
    )
    .groupBy(
      'products.product_id',
      'categories.category_name',
      'products.product_name',
      'products.quantity_in_stock',
      'products.unit_price',
      'products.product_image',
      'products.status'
    );
};

module.exports = {
  getAllProducts,
};
