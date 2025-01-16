// seeds/vendors.js
exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('vendors')
    .del()
    .then(function () {
      // Inserts seed entries
      return knex('vendors').insert([
        { vendor_name: 'Vendor A', contact_name: 'John Doe', address: '123 Main St', city: 'City A', postal_code: '12345', country: 'Country A', phone: '123-456-7890', status: '1' },
        { vendor_name: 'Vendor B', contact_name: 'Jane Smith', address: '456 Another St', city: 'City B', postal_code: '67890', country: 'Country B', phone: '987-654-3210', status: '1' },
        { vendor_name: 'Vendor C', contact_name: 'Sam Johnson', address: '789 Some St', city: 'City C', postal_code: '11223', country: 'Country C', phone: '555-123-4567', status: '1' },
      ]);
    });
};
