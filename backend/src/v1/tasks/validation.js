exports.validateProductData = async (data, knex) => {
    const validRecords = [];
    const invalidRecords = [];
  
    // Fetch existing vendor names from the database (use vendor_name for comparison)
    const existingVendors = await knex('vendors').select('vendor_name'); 
    // Convert the array of vendor names into a Set for fast lookup
    const existingVendorNames = new Set(existingVendors.map(vendor => vendor.vendor_name.toLowerCase())); 
  
    // Loop through each record and validate
    for (const [index, record] of data.entries()) {
      let isValid = true;
      const errors = [];
  
      // Check if product name is provided
      if (!record.product_name || record.product_name.trim() === '') {
        isValid = false;
        errors.push('Product name is required');
      }
  
      let vendorNames = [];
      if (record.vendors) {
        if (typeof record.vendors === 'string') {
          vendorNames = [record.vendors.trim()]; // Convert string to an array
        } else if (Array.isArray(record.vendors)) {
          vendorNames = record.vendors;
        }
      }
  
      // Check if vendors array is empty
      if (vendorNames.length === 0) {
        isValid = false;
        errors.push('At least one vendor is required');
      } else {
        // Check if all vendors exist in the database (by vendor_name)
        const invalidVendorNames = vendorNames.filter(vendorName => !existingVendorNames.has(vendorName.trim().toLowerCase()));
  
        if (invalidVendorNames.length > 0) {
          isValid = false;
          errors.push(`Invalid vendor names: ${invalidVendorNames.join(', ')}`);
        }
      }
  
      // Check if price is a valid number (greater than 0)
      if (isNaN(record.unit_price) || record.unit_price <= 0) {
        isValid = false;
        errors.push('Valid unit price is required');
      }
  
      // Check if quantity_in_stock is a valid non-negative integer
      if (!Number.isInteger(record.quantity_in_stock) || record.quantity_in_stock < 0) {
        isValid = false;
        errors.push('Quantity in stock must be a non-negative integer');
      }
  
      // Check if category_id exists and is valid
      if (!record.category_id || !Number.isInteger(record.category_id) || record.category_id <= 0) {
        isValid = false;
        errors.push('Valid category ID is required');
      }
  
      // If the record is valid, push to validRecords
      if (isValid) {
        validRecords.push(record);
      } else {
        // If the record is invalid, push to invalidRecords with the error messages
        invalidRecords.push({
          index,
          record,
          errors,
        });
      }
    }
  
    return { validRecords, invalidRecords };
  };
  
  
  // Generate error sheet for invalid records
exports.generateErrorSheet = (invalidRecords) => {
    const errorData = invalidRecords.map(item => ({
      ...item.record,
      errors: item.errors.join(', '), // Combine all errors into a single string
    }));
  
    const XLSX = require('xlsx');
    const ws = XLSX.utils.json_to_sheet(errorData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Errors');
  
    // Write the workbook to a buffer
    const errorBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    return errorBuffer; // This buffer will be uploaded to S3
  };
  