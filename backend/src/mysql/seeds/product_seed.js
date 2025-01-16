// seeds/products.js
exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('products')
    .del()
    .then(function () {
      // Inserts seed entries
      return knex('products').insert([
        { product_name: 'Smartphone', category_id: 1, quantity_in_stock: 100, unit_price: 500.00, product_image: 'smartphone.jpg', status: '1' },
        { product_name: 'Laptop', category_id: 1, quantity_in_stock: 50, unit_price: 1000.00, product_image: 'laptop.jpg', status: '1' },
        { product_name: 'Sofa', category_id: 2, quantity_in_stock: 20, unit_price: 700.00, product_image: 'sofa.jpg', status: '1' },
        { product_name: 'Shirt', category_id: 3, quantity_in_stock: 200, unit_price: 30.00, product_image: 'shirt.jpg', status: '1' },
      ]);
    });
};
