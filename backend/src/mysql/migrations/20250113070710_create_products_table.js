exports.up = function (knex) {
    return knex.schema.createTable('products', (table) => {
      table.increments('product_id').primary();
      table.string('product_name', 255).notNullable();
      table.integer('category_id').unsigned().notNullable();
      table.foreign('category_id').references('category_id').inTable('categories').onDelete('CASCADE');
      table.integer('quantity_in_stock').defaultTo(0);
      table.decimal('unit_price', 10, 2);
      table.string('product_image', 500);
      table.enu('status', ['0', '1', '2', '99']).defaultTo('1'); // 0: created, 1: active, 2: inactive, 99: deleted
      table.timestamps(true, true); // created_at, updated_at
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable('products');
  };
  