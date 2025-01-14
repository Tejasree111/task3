exports.up = function (knex) {
    return knex.schema.createTable('vendors', (table) => {
      table.increments('vendor_id').primary();
      table.string('vendor_name', 255).notNullable();
      table.string('contact_name', 255);
      table.string('address', 500);
      table.string('city', 255);
      table.string('postal_code', 20);
      table.string('country', 255);
      table.string('phone', 50);
      table.enu('status', ['0', '1', '2', '99']).defaultTo('1'); // 0: created, 1: active, 2: inactive, 99: deleted
      table.timestamps(true, true); // created_at, updated_at
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable('vendors');
  };
  