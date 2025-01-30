exports.up = function (knex) {
    return knex.schema.alterTable('users', (table) => {
      table.string('refresh_token', 500).nullable(); 
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.alterTable('users', (table) => {
      table.dropColumn('refresh_token'); 
    });
  };