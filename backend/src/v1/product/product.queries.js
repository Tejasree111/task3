const knex = require('../../mysql/connection');
/*
const getAllProducts = (limit, offset) => {
  return knex('products')
    .join('categories', 'products.category_id', '=', 'categories.category_id')
    .join('product_to_vendor', 'products.product_id', '=', 'product_to_vendor.product_id')
    .join('vendors', 'product_to_vendor.vendor_id', '=', 'vendors.vendor_id')
    .select(
      'products.product_id',
      'products.product_name',
      'categories.category_name',
      knex.raw('GROUP_CONCAT(vendors.vendor_name) AS vendors'),
      'products.quantity_in_stock',
      'products.unit_price',
      'products.product_image',
      'products.status',
    )
    .whereNot('products.status', "99")
    .groupBy(
      'products.product_id',
      'categories.category_name',
      'products.product_name',
      'products.quantity_in_stock',
      'products.unit_price',
      'products.product_image',
      'products.status',
    )
    .limit(limit)
    .offset(offset);
};
*/

const getAllProducts = (limit, offset, searchTerm) => {
  const query = knex('products')
    .join('categories', 'products.category_id', '=', 'categories.category_id')
    .join('product_to_vendor', 'products.product_id', '=', 'product_to_vendor.product_id')
    .join('vendors', 'product_to_vendor.vendor_id', '=', 'vendors.vendor_id')
    .select(
      'products.product_id',
      'products.product_name',
      'categories.category_name',
      knex.raw('GROUP_CONCAT(vendors.vendor_name) AS vendors'),
      'products.quantity_in_stock',
      'products.unit_price',
      'products.product_image',
      'products.status',
    )
    .whereNot('products.status', "99")
    .groupBy(
      'products.product_id',
      'categories.category_name',
      'products.product_name',
      'products.quantity_in_stock',
      'products.unit_price',
      'products.product_image',
      'products.status',
    )
    .limit(limit)
    .offset(offset);

  // Apply search filter if searchTerm is provided
  if (searchTerm) {
    query.where(function() {
      this.where('products.product_name', 'like', `%${searchTerm}%`)
          .orWhere('categories.category_name', 'like', `%${searchTerm}%`)
          .orWhere('vendors.vendor_name', 'like', `%${searchTerm}%`);
    });
  }

  return query;
};
const getProductCount = () => {
  return knex('products').count('product_id as total').whereNot("status","99");
};

const getAllVendors = () => {
  return knex('vendors').select('vendor_id', 'vendor_name');
};

const getAllCategories = () => {
  return knex('categories').select('category_id', 'category_name');
};

const updateProductStatus = (productId, status) => {
  return knex('products').where('product_id', productId).update({ status });
};

module.exports = { getAllProducts, getProductCount, getAllVendors, getAllCategories, updateProductStatus};
