const knexConfig = require('../../mysql/knexfile'); // Import knex configuration
const knex = require('knex')(knexConfig.development);

// Controller to handle the import data
exports.importData = async (req, res) => {
  const products = req.body;
  console.log(products);

  try {
    // Process each product in the imported data
    for (let product of products) {
      // Check if the category exists
      let category = await knex('categories').where('category_name', product.category_name).first();
      if (!category) {
        // If the category does not exist, create a new one
        category = await knex('categories').insert({
          category_name: product.category_name,
          description: product.category_description || '',  // Assuming there might be a description
          status: '1'  // Active
        }).returning('*');
      }

      // Check if the vendor exists
      let vendor = await knex('vendors').where('vendor_name', product.vendors).first();
      if (!vendor) {
        // If the vendor does not exist, create a new one
        vendor = await knex('vendors').insert({
          vendor_name: product.vendors,
          contact_name: product.vendor_contact_name || '',
          address: product.vendor_address || '',
          city: product.vendor_city || '',
          postal_code: product.vendor_postal_code || '',
          country: product.vendor_country || '',
          phone: product.vendor_phone || '',
          status: '1'  // Active
        });
      }

      // Insert the product if it doesn't exist
      let existingProduct = await knex('products').where('product_name', product.product_name).first();
      if (!existingProduct) {
        // Insert new product
        existingProduct=await knex('products').insert({
          product_name: product.product_name,
          category_id: category.category_id,
          quantity_in_stock: product.quantity_in_stock || 0,
          unit_price: product.unit_price || 0,
          product_image: product.product_image || '', // Assuming product image is passed
          status: '1'  // Active
        });
      }
  console.log("existing product",existingProduct);

      // Optionally, associate the product with the vendor
      await knex('product_to_vendor').insert({
        vendor_id: vendor.vendor_id,
        product_id: existingProduct.product_id,
        status: '1'  // Active
      });
    }

    res.status(200).json({ message: 'Data imported successfully' });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ error: 'Error importing data' });
  }
};
