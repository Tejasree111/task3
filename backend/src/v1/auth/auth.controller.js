const authService = require('./auth.service');
const { signupSchema } = require('../validations/auth.validation');
const jwt = require('jsonwebtoken')
const authQueries = require('./auth.queries')


const signup = async (req, res) => {
    const { username, password, email, first_name, last_name } = req.body;

    if (!username || !password || !email || !first_name || !last_name) {
        return res.status(400).send('All fields are required');
    }
     // Validate request body using Joi
  const { error } = signupSchema.validate({ username, password, email, first_name, last_name });
  if (error) {
    const errorDetails = error.details.map((detail) => detail.message);
    return res.status(400).json({ errors: errorDetails });
  }

    try {
        console.log('Signup controller called');
        const accessToken = await authService.signup({ username, password, email, first_name, last_name });
        res.json({ accessToken });
    } catch (err) {
        console.error('Error in signup controller:', err);
        res.status(500).send('Error saving user to database');
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const accessToken = await authService.login({ email, password });
        res.json({ message: 'Login successful', accessToken });
    } catch (err) {
        console.error('Error in login controller:', err);
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

const getProfile = async (req, res) => {
  try {
      //const token = req.headers.authorization?.split(' ')[1]; // Assuming JWT is sent as Bearer token
      //if (!token) return res.status(401).send('Unauthorized');

      //const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await authQueries.getUserById(req.user.id); // Assuming you store user ID in JWT payload

      if (!user) return res.status(404).send('User not found');

      // Return only the required fields
      res.json({
          firstName: user.first_name,
          lastName: user.last_name,
          username:user.username,
          email: user.email,
      });
  } catch (err) {
      console.error('Error fetching user profile:', err);
      res.status(500).send('Server Error');
  }
};



module.exports = { signup ,login,getProfile};