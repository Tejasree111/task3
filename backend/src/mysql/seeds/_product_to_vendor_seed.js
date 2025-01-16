// seeds/product_to_vendor.js
exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('product_to_vendor')
    .del()
    .then(function () {
      // Inserts seed entries
      return knex('product_to_vendor').insert([
        { vendor_id: 1, product_id: 1, status: '1' },
        { vendor_id: 2, product_id: 2, status: '1' },
        { vendor_id: 3, product_id: 3, status: '1' },
        { vendor_id: 1, product_id: 4, status: '1' },
      ]);
    });
};
