exports.up = function (knex) {
    return knex.schema.createTable('product_to_vendor', (table) => {
      table.increments('product_to_vendor_id').primary();
      table.integer('vendor_id').unsigned().notNullable();
      table.foreign('vendor_id').references('vendor_id').inTable('vendors').onDelete('CASCADE');
      table.integer('product_id').unsigned().notNullable();
      table.foreign('product_id').references('product_id').inTable('products').onDelete('CASCADE');
      table.enu('status', ['0', '1', '2', '99']).defaultTo('1'); // 0: created, 1: active, 2: inactive, 99: deleted
      table.timestamps(true, true); // created_at, updated_at
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable('product_to_vendor');
  };
  