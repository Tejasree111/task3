//const { error } = require('console');
const s3 = require('../../aws/s3/s3.config'); // Import S3 configuration
const knexConfig = require('../../mysql/knexfile'); // Import knex configuration
const knex = require('knex')(knexConfig.development);
const AWS = require('aws-sdk');
const path = require('path');
const { io } = require('../../server'); 

// Upload file to S3 bucket
const uploadToS3 = async (fileData, fileName) => {
  if (!fileData) {
    throw new Error('File data is missing');
  }

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME, // Set your bucket name
    Key: `tejasree@AKV0771/imports/${fileName}`,
    Body: fileData, // The actual file data
    ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    //ACL: 'public-read',
  };

  try {
    const s3Response = await s3.upload(params).promise();
    
    return s3Response.Location; // Return the S3 URL
  } catch (error) {
    console.error('Error uploading to S3:', error);
   
    throw new Error('Error uploading file to S3');
  }
};

const importData = async (req, res) => {
  console.log('Incoming file(s):', req.files);

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  try {
    const uploadedFiles = [];

    for (const file of req.files) {
      console.log(`Uploading file: ${file.originalname}`);
     
      // Upload file directly to S3
      const s3Path = await uploadToS3(file.buffer, file.originalname);
      console.log(`File uploaded to S3: ${s3Path}`);

      // // Extract product data (assuming it's in a tabular format, such as Excel)
      // const productData = await parseExcelFile(file.buffer); // Implement this function to parse your file

      // const products = [];

      // for (const record of productData) {
      //   const {
      //     product_name,
      //     category_name,
      //     vendors,
      //     quantity_in_stock,
      //     unit_price,
      //     status,
      //     category_id,
      //     vendor_id,
      //     product_image, // Assuming this field contains the image URL if provided
      //   } = record;

      //   // Step 1: Check if the product already exists in the products table
      //   let product = await knex('products')
      //     .where('product_name', product_name)
      //     .first(); // Get the first matching product by name

      //   // Step 2: Update product image if the product exists and product_image URL is provided
      //   if (product) {
      //     console.log(`Product ${product_name} found. Updating image.`);

      //     // Update the product's image URL if it's provided in the uploaded data
      //     if (product_image) {
      //       await knex('products')
      //         .where('product_id', product.product_id)
      //         .update({
      //           product_image: product_image, // Set the new image URL
      //         });
      //       console.log(`Product image for ${product_name} updated to ${product_image}`);
      //     }
      //   } else {
      //     console.log(`Product ${product_name} not found. Inserting new product.`);

      //     // Insert product record in the database
      //     const [insertedProduct] = await knex('products')
      //       .insert({
      //         product_name,
      //         //category_name,
      //         //vendors,
      //         quantity_in_stock,
      //         unit_price,
      //         status: status || '1',
      //         category_id,
      //         //vendor_id,
      //         product_image: product_image || null, // Use the provided image URL or null
      //       })
      //       .returning('*'); // Returning inserted record

      //     console.log(`Inserted new product ${insertedProduct.product_name}`);
      //     products.push(insertedProduct);
      //   }
      // }
      const userId = req.user.id;
      await knex('imported_files').insert({
        file_name: file.originalname,
        file_path: s3Path,
        user_id: userId,
        status: 'pending',
      });

    }
    return res.status(200).json({ message: 'Files uploaded successfully', files: uploadedFiles });
  } catch (error) {
    console.error('Error uploading files:', error);
    return res.status(500).json({ error: 'Failed to upload files' });
  }
};

// Helper function to parse Excel file
const parseExcelFile = async (fileBuffer) => {
  const xlsx = require('xlsx');
  const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = xlsx.utils.sheet_to_json(sheet);

  return jsonData;
};

const createProduct = async (validRecord) => {
  const trx = await knex.transaction();
  try {
    // Step 1: Check if the product already exists
    let existingProduct = await trx('products')
      .where('product_name', validRecord.product_name)
      .first();

    let productId;

    if (existingProduct) {
      console.log(`Product ${validRecord.product_name} already exists. Updating stock.`);

      // Update stock quantity
      await trx('products')
        .where('product_id', existingProduct.product_id)
        .update({
          quantity_in_stock: trx.raw('quantity_in_stock + ?', [validRecord.quantity_in_stock])
        });

      productId = existingProduct.product_id;
    } else {
      console.log(`Product ${validRecord.product_name} does not exist. Inserting new product.`);

      // Insert new product
      const [newProductId] = await trx('products').insert({
        product_name: validRecord.product_name,
        category_id: validRecord.category_id,
        quantity_in_stock: validRecord.quantity_in_stock,
        unit_price: validRecord.unit_price,
        product_image: validRecord.product_image || null,
        status: validRecord.status || '1',
      });

      productId = newProductId;
      console.log(`Inserted new product: ${validRecord.product_name} (ID: ${productId})`);
    }

    // Step 2: Handle vendor relationships
    if (validRecord.vendors && validRecord.vendors.length > 0) {
      const vendors = Array.isArray(validRecord.vendors) ? validRecord.vendors : [validRecord.vendors];

      console.log(`Processing vendors for ${validRecord.product_name}:`, vendors);

      // Fetch vendor IDs based on names
      const existingVendors = await trx('vendors')
        .whereIn('vendor_name', vendors)
        .select('vendor_id', 'vendor_name');

      const existingVendorMap = existingVendors.reduce((acc, vendor) => {
        acc[vendor.vendor_name] = vendor.vendor_id;
        return acc;
      }, {});

      // Identify new vendors that do not exist in the database
      const newVendors = vendors.filter(vendorName => !existingVendorMap[vendorName]);

      let newVendorIds = {};
      if (newVendors.length > 0) {
        console.log(`Inserting new vendors: ${newVendors.join(', ')}`);

        // Insert new vendors and get their IDs
        const insertedVendors = await trx('vendors')
          .insert(newVendors.map(name => ({ vendor_name: name })))
          .then(() => trx('vendors').whereIn('vendor_name', newVendors).select('vendor_id'));

        insertedVendors.forEach(({ vendor_id }) => {
          newVendorIds[vendor_id] = vendor_id;
        });
      }

      // Merge existing and new vendors
      const finalVendorMap = { ...existingVendorMap, ...newVendorIds };

      // Log the final vendor map to ensure it contains vendor_id
      console.log('Final Vendor Map:', finalVendorMap);

      // Check if vendor-to-product relationships already exist and update or insert
      for (const vendorName of vendors) {
        const vendorId = finalVendorMap[vendorName];

        // If vendorId is undefined, log it for debugging
        if (vendorId === undefined) {
          console.log(`Error: Undefined vendorId for vendor ${vendorName}`);
          continue; // Skip this vendor if there's an issue
        }

        console.log('Product Id:', productId);
        console.log('Vendor Id:', vendorId);

        const existingVendorProduct = await trx('product_to_vendor')
          .where('product_id', productId)
          .andWhere('vendor_id', vendorId)
          .first();

        if (existingVendorProduct) {
          // If it exists, update the status
          console.log(`Updating status for existing vendor-product relationship: ${vendorName}`);
          await trx('product_to_vendor')
            .where('product_to_vendor_id', existingVendorProduct.product_to_vendor_id)
            .update({
              status: '1', // or whatever status you want
              updated_at: trx.raw('CURRENT_TIMESTAMP')
            });
        } else {
          // If it doesn't exist, insert a new relationship
          console.log(`Inserting new vendor-product relationship for: ${vendorName}`);
          await trx('product_to_vendor').insert({
            vendor_id: vendorId,
            product_id: productId,
            status: '1', // or whatever status you want
            created_at: trx.raw('CURRENT_TIMESTAMP'),
            updated_at: trx.raw('CURRENT_TIMESTAMP')
          });
        }
      }

      console.log(`Processed vendor-product relationships for ${validRecord.product_name}`);
    }

    await trx.commit();
    console.log(`Successfully processed ${validRecord.product_name}`);
  } catch (error) {
    await trx.rollback();
    console.error(`Error processing ${validRecord.product_name}:`, error);
    throw new Error('Failed to insert product and vendor relationship');
  }
};

const getUserUploads = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from authenticated request
    const page = parseInt(req.query.page) || 1; // Default to page 1 if no page is provided
    const limit = parseInt(req.query.limit) || 5; // Default to 10 uploads per page
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    const userUploads = await knex('imported_files')
      .where('user_id', userId)
      .select('file_name', 'status', 'error_file_path', 'file_path')
      .limit(limit)
      .offset(offset);
    
    // Count total records to calculate total pages
    const totalUploads = await knex('imported_files')
      .where('user_id', userId)
      .count('* as total');
    
    const totalPages = Math.ceil(totalUploads[0].total / limit);
    
    // Respond with the user uploads and pagination info
    res.json({ uploads: userUploads, totalPages });
  } catch (error) {
    console.error('Error fetching uploads:', error);
    res.status(500).json({ error: 'Failed to fetch uploads' });
  }
};

module.exports = { uploadToS3, importData, createProduct,getUserUploads };
