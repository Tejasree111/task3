exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('product_to_vendor')
    .del()
    .then(function () {
      // Inserts seed entries
      return knex('product_to_vendor').insert([
        { vendor_id: 1, product_id: 326, status: '1' },
        { vendor_id: 1, product_id: 327, status: '1' },
        { vendor_id: 1, product_id: 328, status: '1' },
        { vendor_id: 2, product_id: 329, status: '1' },
        { vendor_id: 2, product_id: 330, status: '1' },
        { vendor_id: 3, product_id: 331, status: '1' },
        { vendor_id: 3, product_id: 332, status: '1' },
        { vendor_id: 4, product_id: 333, status: '1' },
        { vendor_id: 5, product_id: 334, status: '1' },
        { vendor_id: 6, product_id: 335, status: '2' },
        { vendor_id: 7, product_id: 326, status: '1' },
        { vendor_id: 8, product_id: 327, status: '2' },
        { vendor_id: 9, product_id: 328, status: '2' },
        { vendor_id: 10, product_id: 329, status: '1' },
      ]);
    });
};
