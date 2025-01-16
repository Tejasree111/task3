// seeds/users.js
exports.seed = function (knex) {
    // Deletes ALL existing entries
    return knex('users')
      .del()
      .then(function () {
        // Inserts seed entries
        return knex('users').insert([
          { first_name: 'Alice', last_name: 'Johnson', username: 'alicej', password: 'password123', email: 'alice@example.com', profile_pic: 'alice.jpg', status: '1' },
          { first_name: 'Bob', last_name: 'Smith', username: 'bobsmith', password: 'password123', email: 'bob@example.com', profile_pic: 'bob.jpg', status: '1' },
          { first_name: 'Charlie', last_name: 'Brown', username: 'charliebrown', password: 'password123', email: 'charlie@example.com', profile_pic: 'charlie.jpg', status: '1' },
        ]);
      });
  };
  