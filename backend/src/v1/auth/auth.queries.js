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

const saveRefreshToken = async (userId, refreshToken) => {
    try {
      await db('users').where({ user_id: userId }).update({ refresh_token: refreshToken });
    } catch (err) {
      console.error('Error saving refresh token:', err);
      throw err;
    }
  };
  
  const getUserById = async (userId) => {
    try {
      const user = await db('users')
        .select('*')
        .where({ user_id: userId })
        .first();
      return user;
    } catch (err) {
      console.error('Error fetching user by ID:', err);
      throw err;
    }
  };
  
const getUserByEmail = async (email) => {
    try {
        console.log('Fetching user by email:', email);
        const result = await db('users').where({ email }).first();  
        if (result) {
            console.log('User found:', result);
            return result;  
        } else {
            console.log('No user found with that email');
            return null; 
        }
    } catch (err) {
        console.error('Error querying user by email:', err);
        throw err;
    }
};

const saveResetToken = async (userId, token, expiresAt) => {
  try {
    await db('users').where({ user_id: userId }).update({ reset_token: token, reset_token_expires: expiresAt });
  } catch (err) {
    console.error('Error saving reset token:', err);
    throw err;
  }
};

// Get user by reset token
const getUserByResetToken = async (token) => {
  try {
    const user = await db('users').where({ reset_token: token }).andWhere('reset_token_expires', '>', new Date()).first();
    return user;
  } catch (err) {
    console.error('Error fetching user by reset token:', err);
    throw err;
  }
};

// Update user password
const updateUserPassword = async (userId, hashedPassword) => {
  try {
    await db('users').where({ user_id: userId }).update({ password: hashedPassword, reset_token: null, reset_token_expires: null });
  } catch (err) {
    console.error('Error updating password:', err);
    throw err;
  }
};


module.exports = { insertUser, getUserByEmail,getUserById,saveRefreshToken,saveResetToken,getUserByResetToken,updateUserPassword};

