exports.up = function (knex) {
    return knex.schema.alterTable('users', (table) => {
      table.integer('role_id').unsigned().nullable().references('role_id').inTable('roles').onDelete('SET NULL');
      table.integer('branch_id').unsigned().nullable().references('branch_id').inTable('branch').onDelete('SET NULL');
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.alterTable('users', (table) => {
      table.dropColumn('role_id');
      table.dropColumn('branch_id');
    });
  };
  