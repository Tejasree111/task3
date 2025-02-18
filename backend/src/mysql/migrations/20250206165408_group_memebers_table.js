exports.up = function (knex) {
    return knex.schema.createTable("group_members", (table) => {
      table.increments("id").primary();
      table.integer("group_id").unsigned().notNullable().references("id").inTable("groups").onDelete("CASCADE");
      table.integer("user_id").unsigned().notNullable().references("user_id").inTable("users").onDelete("CASCADE");
      table.timestamp("joined_at").defaultTo(knex.fn.now());
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable("group_members");
  };
  