const db = require('../../mysql/connection');

const insertUser = async (userData) => {
    try {
        console.log('Inserting user into database:', userData);
        const user=await db('users').insert(userData);
        console.log('User successfully inserted');
        console.log(user);
        return user;
    } catch (err) {
        console.error('Error inserting user into database:', err);
        throw err;
    }
};

const getUserById = async (userId) => {
    try {
        console.log('Fetching user by ID:', {user_id:userId});
        const user_id=userId;
        return await db('users')
            .select('first_name', 'last_name', 'email','username', 'thumbnail')
            .where("user_id", user_id )
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
        const result = await db('users').where({ email }).first();  
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