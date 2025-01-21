const authService = require('./auth.service');
const { signupSchema } = require('../validations/auth.validation');
const jwt = require('jsonwebtoken')

const signup = async (req, res) => {
  const { username, password, email, first_name, last_name } = req.body;

  // Validate input
  const { error } = signupSchema.validate({ username, password, email, first_name, last_name });
  if (error) return res.status(400).json({ errors: error.details.map(detail => detail.message) });

  try {
    const user = await authService.signup({ username, password, email, first_name, last_name });
    res.json({ user });
  } catch (err) {
    res.status(500).send('Error saving user');
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const accessToken = await authService.login({ email, password });
    res.json({ message: 'Login successful', accessToken });
  } catch (err) {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

const getProfile = async (req, res) => {
    const token=req.headers["authorization"];
    console.log("thoekn"+token);
  try {
    const decoded=jwt.verify(token,process.env.JWT_SECRET)
    console.log(decoded.id);
    const user = await authService.getUserProfile(decoded.id);
    console.log(user);
    res.json( {
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      email: user.email,
      profileImage: user.thumbnail,
    });
  } catch (err) {
    res.status(500).send('Error fetching user profile');
  }
};

module.exports = { signup, login, getProfile };
