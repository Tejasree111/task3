const jwt = require('jsonwebtoken');
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
  
  const accessToken = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET);
  return accessToken;
};

const getUserProfile = async (userId) => {
  console.log(userId);
  const user = await authQueries.getUserById(userId);
  console.log(user);
  return {
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username,
    email: user.email,
    profileImage: user.profile_pic,
  };
};

module.exports = { signup, login, getUserProfile };
