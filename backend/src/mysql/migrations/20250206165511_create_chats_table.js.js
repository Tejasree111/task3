exports.up = function (knex) {
    return knex.schema.createTable("chats", (table) => {
      table.increments("id").primary();
      table.integer("sender_id").unsigned().notNullable().references("user_id").inTable("users").onDelete("CASCADE");
      table.integer("receiver_id").unsigned().nullable().references("user_id").inTable("users").onDelete("CASCADE"); // NULL for group messages
      table.integer("group_id").unsigned().nullable().references("id").inTable("groups").onDelete("CASCADE"); // NULL for private messages
      table.text("message").notNullable();
      table.boolean("is_read").defaultTo(false);
      table.timestamp("created_at").defaultTo(knex.fn.now());
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable("chats");
  };
  