/*const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authQueries = require('./auth.queries');

const signup = async ({ username, password, email, first_name, last_name }) => {
    try {
        console.log('Signup service called');
        const hashedPassword = await bcrypt.hash(password, 10);
        await authQueries.insertUser({ username, password: hashedPassword, email, first_name, last_name });
        console.log('User inserted into database');

        const user = { username };
        //const accessToken = jwt.sign(user, process.env.JWT_SECRET);
        //return accessToken;
    } catch (err) {
        console.error('Error in signup service:', err);
        throw err;
    }
};

const login = async ({ email, password }) => {
    try {
        // Step 1: Check if the user exists
        const user = await authQueries.getUserByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }
        // Step 2: Compare the password with the hashed password stored in DB
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // Step 3: Generate JWT Token
        const payload = { id: user.user_id,email: user.email };
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Step 4: Return the access token
        return accessToken;
    } catch (err) {
        console.error('Error during login:', err);
        throw err;
    }
};


module.exports = { signup ,login };*/
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
