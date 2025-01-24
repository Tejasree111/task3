exports.up = function (knex) {
    return knex.schema.alterTable('users', (table) => {
      table.string('refresh_token', 500).nullable(); // Add refresh_token column
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.alterTable('users', (table) => {
      table.dropColumn('refresh_token'); // Remove refresh_token column
    });
  };