exports.up = function(knex) {
    return knex.schema.alterTable('products', function(table) {
      table.integer('branch_id').unsigned().nullable(); // Add column
      table.foreign('branch_id').references('branch_id').inTable('branch').onDelete('CASCADE'); // Add foreign key
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.alterTable('products', function(table) {
      table.dropForeign('branch_id');
      table.dropColumn('branch_id');
    });
  };
  