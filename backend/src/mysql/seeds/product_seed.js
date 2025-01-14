// 02_products_seed.js
exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('products')
    .del()
    .then(function () {
      // Inserts seed entries
      return knex('products').insert([
        { product_name: 'Laptop', category_id: 1, quantity_in_stock: 50, unit_price: 999.99, product_image: 'laptop.jpg', status: '1' },
        { product_name: 'Smartphone', category_id: 1, quantity_in_stock: 200, unit_price: 799.99, product_image: 'smartphone.jpg', status: '1' },
        { product_name: 'Wireless Headphones', category_id: 1, quantity_in_stock: 150, unit_price: 199.99, product_image: 'headphones.jpg', status: '1' },
        { product_name: 'Gaming Mouse', category_id: 1, quantity_in_stock: 100, unit_price: 49.99, product_image: 'mouse.jpg', status: '1' },
        { product_name: 'Mechanical Keyboard', category_id: 1, quantity_in_stock: 75, unit_price: 89.99, product_image: 'keyboard.jpg', status: '1' },
        { product_name: '4K Monitor', category_id: 1, quantity_in_stock: 30, unit_price: 499.99, product_image: 'monitor.jpg', status: '1' },
        { product_name: 'External SSD', category_id: 1, quantity_in_stock: 120, unit_price: 149.99, product_image: 'ssd.jpg', status: '1' },
        { product_name: 'Webcam', category_id: 1, quantity_in_stock: 60, unit_price: 89.99, product_image: 'webcam.jpg', status: '1' },
        { product_name: 'Office Chair', category_id: 2, quantity_in_stock: 40, unit_price: 299.99, product_image: 'chair.jpg', status: '1' },
        { product_name: 'Desk Lamp', category_id: 2, quantity_in_stock: 100, unit_price: 29.99, product_image: 'lamp.jpg', status: '1' },
      ]);
    });
};
