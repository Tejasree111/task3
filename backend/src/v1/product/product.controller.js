
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
    const { page = 1, limit = 5, searchTerm = '' ,branch_id} = req.query; // Get pagination parameters and search term
    const offset = (page - 1) * limit;

    const [products, total] = await Promise.all([
      productQueries.getAllProducts(parseInt(limit), parseInt(offset), searchTerm,branch_id),
      productQueries.getProductCount(branch_id), // Get total count of products
    ]);
    //console.log("Products: ", products);
    //console.log(total[0]);
    const totalPages = Math.ceil(total[0].total / limit);
    res.status(200).json({
      products,
      total: total[0].total,
      page: parseInt(page),
      //totalPages: Math.ceil(total[0].total / limit),
      totalPages
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

const addProduct = async (req, res) => {
  const { productData, selectedImage } = req.body;
  const trx = await knex.transaction();

  try {
    let existingProduct = await trx('products')
      .where('product_name', productData.productName)
      .first();

    let productId;

    if (existingProduct) {
      productId = existingProduct.product_id;
      //console.log(`Product ${productData.productName} already exists with ID: ${productId}`);

      await trx('products')
        .where('product_id', productId)
        .update({
          quantity_in_stock: existingProduct.quantity_in_stock + productData.quantity, 
          status: productData.status || existingProduct.status ,
          branch_id:productData.branch,
          product_image: selectedImage
        });

      console.log(`Updated ${productData.productName}: Increased quantity to ${existingProduct.quantity_in_stock + productData.quantity}, Status: ${productData.status || existingProduct.status}`);
      const existingVendorProduct = await trx('product_to_vendor')
        .where('product_id', productId)
        .andWhere('vendor_id', productData.vendor)
        .first();

      if (!existingVendorProduct) {
        console.log(`Adding new vendor relation for product ${productData.productName}`);
        await trx('product_to_vendor').insert({
          product_id: productId,
          vendor_id: productData.vendor,
          status: productData.status || '1'
        });
        console.log(`Inserted new vendor-product relationship for vendor ID: ${productData.vendor}`);
      }

    } else {
      //console.log("Adding new product:", productData);

      const [newProductId] = await trx('products').insert({
        product_name: productData.productName,
        category_id: productData.category,
        quantity_in_stock: productData.quantity,
        unit_price: productData.unit,
        product_image: selectedImage || '', // Handle null or empty image paths
        status: productData.status || '1', // Default status to active
        branch_id: productData.branch,
      });

      productId = newProductId;
      //console.log(`Inserted new product: ${productData.productName} with ID: ${productId}`);

      await trx('product_to_vendor').insert({
        product_id: productId,
        vendor_id: productData.vendor,
        status: productData.status || '1',
      });

      //console.log(`Inserted new vendor-product relationship for vendor ID: ${productData.vendor}`);
    }

    await trx.commit();
    res.status(201).json({
      product_id: productId,
      message: "Product added or updated successfully."
    });

  } catch (error) {

    await trx.rollback();
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
};

/*
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
*/
const updateProduct = async (req, res) => {
  const { productId } = req.params;
  const { product_name, category_id, quantity_in_stock, unit_price, status, vendors, vendor_statuses } = req.body;

  const trx = await knex.transaction();

  try {
    console.log('Updating Product with Vendors:', vendors);
    const vendorNames = Array.isArray(vendors) ? vendors : [vendors];
    const vendorRecords = await trx('vendors').whereIn('vendor_name', vendorNames);

    if (vendorRecords.length !== vendorNames.length) {
      await trx.rollback();
      return res.status(404).json({ message: 'One or more vendors not found' });
    }
    const updatedProduct = await trx('products')
      .where('product_id', productId)
      .update({
        product_name,
        category_id,
        quantity_in_stock,
        unit_price,
        status,
      });

    if (updatedProduct === 0) {
      await trx.rollback();
      return res.status(404).json({ message: 'Product not found' });
    }
    await trx('product_to_vendor').where('product_id', productId).del();
    
    const vendorData = vendorRecords.map((vendor, index) => ({
      product_id: productId,
      vendor_id: vendor.vendor_id,
      status: vendor_statuses ? vendor_statuses[index] || '1' : '1',
    }));

    await trx('product_to_vendor').insert(vendorData);

    await trx.commit();
    res.status(200).json({ message: 'Product updated successfully with vendors' });
  } catch (error) {
    await trx.rollback();
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};


module.exports = { getProducts, getVendorsAndCategories, updateProductStatus, addProduct ,updateProduct};
