const { faker } = require('@faker-js/faker');
const XLSX = require('xlsx');
const fs = require('fs');

// Adjust the total records and percentage of valid/invalid records
const TOTAL_RECORDS = 20000;
const VALID_PERCENTAGE = 0.75;
const INVALID_PERCENTAGE = 0.25;

// Define your specific vendors with corresponding IDs
const vendors = [
  { name: 'Vendor A', id: 1 },
  { name: 'Vendor B', id: 2 },
  { name: 'Vendor C', id: 3 },
  { name: 'Zepto', id: 5 }
];

// Define categories with their corresponding IDs
const categories = [
  { name: 'Electronics', id: 1 },
  { name: 'Furniture', id: 2 },
  { name: 'Clothing', id: 3 }
];

const generateValidRecord = () => {
  // Randomly select a vendor from the list and use its ID
  const selectedVendor = faker.helpers.arrayElement(vendors);
  
  // Randomly select a category from the list
  const selectedCategory = faker.helpers.arrayElement(categories);

  return {
    product_name: faker.commerce.productName(),
    category_id: selectedCategory.id,  // Use the category ID
    category_name: selectedCategory.name, // Use the category name
    vendors: selectedVendor.name,  // Use the vendor name
    vendor_id: selectedVendor.id,  // Use the vendor ID
    quantity_in_stock: faker.datatype.number({ min: 1, max: 500 }),
    unit_price: faker.commerce.price({ min: 1, max: 1000, dec: 2 }),
    status: faker.helpers.arrayElement(['0', '1', '2']),
    product_image: faker.image.imageUrl(),
  };
};

const generateInvalidRecord = () => {
  const invalidRecord = generateValidRecord();

  // Randomly remove or corrupt fields to make them invalid
  const invalidCases = [
    () => delete invalidRecord.product_name, // Missing product name
    () => (invalidRecord.unit_price = -1), // Invalid price
    () => (invalidRecord.quantity_in_stock = 'invalid_number'), // Invalid quantity
    () => (invalidRecord.category_id = null), // Missing category ID
    () => (invalidRecord.vendors = ''), // Missing vendors
  ];

  // Apply a random invalid case
  faker.helpers.arrayElement(invalidCases)();

  return invalidRecord;
};

// Generate data
const validCount = Math.floor(TOTAL_RECORDS * VALID_PERCENTAGE);
const invalidCount = Math.ceil(TOTAL_RECORDS * INVALID_PERCENTAGE);

const records = [
  ...Array.from({ length: validCount }, generateValidRecord),
  ...Array.from({ length: invalidCount }, generateInvalidRecord),
];

// Convert to Excel
const ws = XLSX.utils.json_to_sheet(records);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Products');

// Specify the output file path
const filePath = 'generated_products_20k.xlsx';
XLSX.writeFile(wb, filePath);

console.log(`Excel file with ${validCount} valid and ${invalidCount} invalid records created: ${filePath}`);
