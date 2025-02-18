/*const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authQueries = require('./auth.queries');

const signup = async ({ username, password, email, first_name, last_name }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return await authQueries.insertUser({ username, password: hashedPassword, email, first_name, last_name });

};

const login = async ({ email, password }) => {
  const user = await authQueries.getUserByEmail(email);
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid credentials');
  }
  
  const accessToken = jwt.sign({ id: user.user_id, username: user.username }, process.env.JWT_SECRET);
  return accessToken;
};

const getUserProfile = async (userId) => {
  console.log(userId);
  return await authQueries.getUserById(userId);
  console.log(user);
  return {
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username,
    email: user.email,
    profileImage: user.profile_pic,
  };
};

module.exports = { signup, login, getUserProfile};
*/

const crypto = require('crypto');
const db = require('../../mysql/connection');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authQueries = require('./auth.queries');



// Save the reset token in the database
const saveResetToken = async (email, resetToken, expirationTime) => {
  try {
    await db('users')
      .where({ email })
      .update({ reset_token: resetToken, reset_token_expiration: expirationTime });
  } catch (err) {
    console.error('Error saving reset token:', err);
    throw err;
  }
};

// Verify the reset token
const verifyResetToken = async (token) => {
  try {
    const user = await db('users')
      .where('reset_token', token)
      .andWhere('reset_token_expiration', '>', Date.now())
      .first();

    if (!user) {
      return null;  // Token is invalid or expired
    }

    return user;
  } catch (err) {
    console.error('Error verifying reset token:', err);
    throw err;
  }
};

// Update the password in the database
const updatePassword = async (userId, hashedPassword) => {
  try {
    await db('users')
      .where({ user_id: userId })
      .update({ password: hashedPassword, reset_token: null, reset_token_expiration: null });
  } catch (err) {
    console.error('Error updating password:', err);
    throw err;
  }
};

// Helper function to generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user.user_id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};

const signup = async ({ username, password, email, first_name, last_name,role_id,branch_id}) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return await authQueries.insertUser({ username, password: hashedPassword, email, first_name, last_name,role_id,branch_id});

};

const login = async ({ email, password }) => {
  const user = await authQueries.getUserByEmail(email);
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid credentials');
  }

  const { accessToken, refreshToken } = generateTokens(user);
  
  // Save refresh token in the database
  await authQueries.saveRefreshToken(user.user_id, refreshToken);

  return { accessToken};
};

const getUserProfile = async (userId) => {
  console.log(userId);
  return await authQueries.getUserById(userId);
};

const refreshAccessToken = async (user_id) => {
  try {
    const user = await authQueries.getUserById(user_id);
    const refreshToken=user.refresh_token;
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    
    if (decoded.id!=user_id) {
      throw new Error('Invalid refresh token');
    }
    const accessToken=jwt.sign({ id: user.user_id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '15m' });

   // await authQueries.saveRefreshToken(user.user_id, newRefreshToken);
    //console.log(accessToken);
    return { accessToken: accessToken};
  } catch (err) {
    throw new Error('Invalid or expired refresh token');
  }
};


// Fetch role_id by role name (Admin, Manager, User)
const getRoleByName = async (roleName) => {
  try {
    const role = await db('roles').where({ role_name: roleName }).first();
    return role;
  } catch (err) {
    console.error('Error fetching role by name:', err);
    throw err;
  }
};
const getBranchByName = async (branchName) => {
  try {
    const branch = await db('branch').where({ branch_name: branchName }).first();
    console.log("branch record:",branch);
    return branch;
  } catch (err) {
    console.error('Error fetching branch by name: ', err);
    throw err;
  }
};

module.exports = { signup, login, refreshAccessToken,getUserProfile,updatePassword,saveResetToken,verifyResetToken,getRoleByName,getBranchByName };
