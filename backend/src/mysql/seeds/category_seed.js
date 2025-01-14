// 01_categories_seed.js
exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('categories')
    .del()
    .then(function () {
      // Inserts seed entries
      return knex('categories').insert([
        { category_id: 1, category_name: 'Electronics' },
        { category_id: 2, category_name: 'Furniture' },
        { category_name: 'Electronics' },
        { category_name: 'Furniture' },
        { category_name: 'Home Appliances' },
        { category_name: 'Books' },
        { category_name: 'Clothing' },
      ]);
    });
};
