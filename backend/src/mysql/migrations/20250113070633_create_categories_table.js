exports.up = function (knex) {
    return knex.schema.createTable('categories', (table) => {
      table.increments('category_id').primary();
      table.string('category_name', 255).notNullable();
      table.string('description', 500);
      table.enu('status', ['0', '1', '2', '99']).defaultTo('1'); // 0: created, 1: active, 2: inactive, 99: deleted
      table.timestamps(true, true); // created_at, updated_at
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable('categories');
  };
  