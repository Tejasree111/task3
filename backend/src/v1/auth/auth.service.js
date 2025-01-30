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
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authQueries = require('./auth.queries');

// Helper function to generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user.user_id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};

const signup = async ({ username, password, email, first_name, last_name }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return await authQueries.insertUser({ username, password: hashedPassword, email, first_name, last_name });

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
  console.log(user);
  return {
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username,
    email: user.email,
    profileImage: user.profile_pic,
  };
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
    console.log(accessToken);
    return { accessToken: accessToken};
  } catch (err) {
    throw new Error('Invalid or expired refresh token');
  }
};

module.exports = { signup, login, refreshAccessToken,getUserProfile };
