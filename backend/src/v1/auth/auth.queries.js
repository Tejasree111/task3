const db = require('../../mysql/connection');

const insertUser = async (userData) => {
    try {
        console.log('Inserting user into database:', userData);
        await db('users').insert(userData);
        console.log('User successfully inserted');
    } catch (err) {
        console.error('Error inserting user into database:', err);
        throw err;
    }
};

const getUserById = async (user_id) => {
    try {
        console.log('Fetching user by ID:', user_id);
        return await db('users')
            .select('first_name', 'last_name', 'email','username', 'thumbnail')
            .where({ user_id })
            .first();
    } catch (err) {
        console.error('Error fetching user by ID:', err);
        throw err;
    }
};

const getUserByEmail = async (email) => {
    try {
        console.log('Fetching user by email:', email);
        // Querying the user from the database by email
        const result = await db('users').where({ email }).first();  // Assuming you're using Knex.js or a similar query builder
        if (result) {
            console.log('User found:', result);
            return result;  // Return the user object
        } else {
            console.log('No user found with that email');
            return null;  // No user found
        }
    } catch (err) {
        console.error('Error querying user by email:', err);
        throw err;
    }
};

module.exports = { insertUser, getUserByEmail,getUserById};