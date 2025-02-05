exports.up = function (knex) {
    return knex.schema.createTable('roles', (table) => {
      table.increments('role_id').primary();
      table.string('role_name', 255).notNullable();
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('users.user_id').onDelete('CASCADE'); // Foreign key reference
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable('roles');
  };
  