
const productQueries = require('./product.queries');
const knexConfig = require('../../mysql/knexfile'); // Import knex configuration
const knex = require('knex')(knexConfig.development);
/*
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
*/
const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 5, searchTerm = '' } = req.query; // Get pagination parameters and search term
    const offset = (page - 1) * limit;

    const [products, total] = await Promise.all([
      productQueries.getAllProducts(parseInt(limit), parseInt(offset), searchTerm),
      productQueries.getProductCount(), // Get total count of products
    ]);

    //console.log("Products: ", products);
    //console.log(total[0]);
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
    console.log(vendors);
  } catch (error) {
    console.error('Error retrieving vendors and categories:', error);
    res.status(500).json({ message: 'Error retrieving vendors and categories', error });
  }
};

const updateProductStatus = async (req, res) => {
  console.log(req.params);
  const { productId } = req.params;
  const status = "99"; 
  try {
    const result = await knex('products')
      .where('product_id', productId)
      .update({ status });

    if (result === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product status updated successfully' });
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({ message: 'Failed to update product status' });
  }
};
//add product working code
/*
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
*/

const addProduct = async (req, res) => {
  const {
    productData, selectedImage
  } = req.body;

  const trx = await knex.transaction();

  try {
    // Step 1: Check if the product already exists in the database
    let existingProduct = await trx('products')
      .where('product_name', productData.productName)
      .first();

    let productId;

    if (existingProduct) {
      // Product exists, use the existing product_id
      productId = existingProduct.product_id;
      console.log(`Product ${productData.productName} already exists with ID: ${productId}`);

      // Step 2: Check if the product-to-vendor relationship already exists
      const existingVendorProduct = await trx('product_to_vendor')
        .where('product_id', productId)
        .andWhere('vendor_id', productData.vendor)
        .first();

      if (!existingVendorProduct) {
        // If the vendor-product relationship doesn't exist, insert a new relation
        console.log(`Inserting new product-to-vendor relation for vendor ID: ${productData.vendor}`);
        await trx('product_to_vendor').insert({
          product_id: productId,
          vendor_id: productData.vendor,
          status: '1' // Set as active
        });
      } else {
        // If the relationship exists, you could optionally update its status here if needed
        console.log(`Vendor-product relationship already exists for product ${productData.productName}`);
      }

    } else {
      // Product doesn't exist, insert new product and its relationship with the vendor

      // Insert product into the products table
      const [newProductId] = await trx('products').insert({
        product_name: productData.productName,
        category_id: productData.category,
        quantity_in_stock: productData.quantity,
        unit_price: productData.unit,
        product_image: selectedImage == null ? '' : selectedImage, // Handle null or empty image paths
        status: productData.status // Default to active if not provided
      });

      productId = newProductId;
      console.log(`Inserted new product: ${productData.productName} with ID: ${productId}`);

      // Insert product-to-vendor relation into the product_to_vendor table
      await trx('product_to_vendor').insert({
        product_id: productId,
        vendor_id: productData.vendor,
        status: '1' // Set as active
      });
      console.log(`Inserted new vendor-product relationship for vendor ID: ${productData.vendor}`);
    }

    // Commit the transaction
    await trx.commit();

    // Return the newly added or updated product with the associated vendor
    res.status(201).json({
      product_id: productId, // Return the product_id
    });

  } catch (error) {
    // If any error occurs, rollback the transaction
    await trx.rollback();
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
};


const updateProduct = async (req, res) => {
  const { productId } = req.params;
  const { product_name, category_id, quantity_in_stock, unit_price, status, vendors, vendor_statuses } = req.body;

  try {
    console.log('Vendors:', vendors);
    const vendorRecords = await knex('vendors').whereIn('vendor_name', vendors);

    // Check if all vendors exist, if not return an error
    if (vendorRecords.length !== vendors.length) {
      return res.status(404).json({ message: 'One or more vendors not found' });
    }

    const updatedProduct = await knex('products')
      .where('product_id', productId)
      .update({
        product_name,
        category_id,  // Ensure category_id is valid
        quantity_in_stock,
        unit_price,
        status,  // Product status
      });

    if (updatedProduct === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Clear existing product-vendor relationships in the product_to_vendor table
    await knex('product_to_vendor').where('product_id', productId).del();
    
    const p2v=await knex('product_to_vendor').insert(
      {
      product_id:productId,
      vendor_id:vendorRecords[0].vendor_id,
      }
    );
    console.log(p2v);

    // Respond with success message
    res.status(200).json({ message: 'Product updated successfully with vendors' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};




module.exports = { getProducts, getVendorsAndCategories, updateProductStatus, addProduct ,updateProduct};
