exports.up = function (knex) {
    return knex.schema.createTable('branch', (table) => {
      table.increments('branch_id').primary();
      table.string('branch_name', 255).notNullable();
      table.string('permissions', 255).notNullable();
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('users.user_id').onDelete('CASCADE'); // Foreign key reference
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable('branch');
  };
  