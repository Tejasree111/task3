exports.up = function(knex) {
    return knex.schema.createTable('imported_files', (table) => {
      table.increments('import_id').primary();
      table.string('file_name').notNullable();
      table.string('file_path').notNullable();  // Store the S3 file path (URL)
      table.string('status').defaultTo('pending'); // possible values: 'pending', 'processed', 'failed'
      table.integer('user_id').unsigned().notNullable();  // Link to the user who uploaded the file
      table.foreign('user_id').references('user_id').inTable('users').onDelete('CASCADE');  // Foreign key to users table
      table.timestamps(true, true); // created_at, updated_at
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('imported_files');
  };