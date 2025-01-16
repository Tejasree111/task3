// seeds/categories.js
exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('categories')
    .del()
    .then(function () {
      // Inserts seed entries
      return knex('categories').insert([
        { category_name: 'Electronics', description: 'Electronic gadgets and devices', status: '1' },
        { category_name: 'Furniture', description: 'Furniture for home and office', status: '1' },
        { category_name: 'Clothing', description: 'Apparel for all genders and ages', status: '1' },
      ]);
    });
};
