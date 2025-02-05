const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const {forgotPasswordSchema} = require('../validations/auth.validation');
const authService = require('./auth.service');
const { signupSchema,resetPasswordSchema} = require('../validations/auth.validation');
const jwt = require('jsonwebtoken')


// Forgot Password Controller
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Validate email
  const { error } = forgotPasswordSchema.validate({ email });
  if (error) return res.status(400).json({ errors: error.details.map(detail => detail.message) });

  try {
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const expirationTime = new Date(Date.now() + 60 *60*1000) // 1 hour expiration

    // Save the reset token and expiration in the database
    await authService.saveResetToken(email, resetToken, expirationTime);

    // Send email with reset link
    const transporter = nodemailer.createTransport({
      host:process.env.SMTP_HOST,
      port:process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const resetUrl = `http://localhost:4200/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `Click the following link to reset your password: ${resetUrl}`,
    };

    transporter.sendMail(mailOptions);

    res.status(200).json({message :"Password reset link has been sent to your email"});
  } catch (err) {
    res.status(500).send('Error sending password reset email');
  }
};

// Reset Password Controller
const resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  // Validate the reset password request
  const { error } = resetPasswordSchema.validate({ newPassword, confirmPassword });
  if (error) return res.status(400).json({ errors: error.details.map(detail => detail.message) });

  if (newPassword !== confirmPassword) {
    return res.status(400).send('Passwords do not match');
  }

  try {
    const user = await authService.verifyResetToken(token);
    if (!user) {
      return res.status(400).send('Invalid or expired reset token');
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await authService.updatePassword(user.user_id, hashedPassword);

    res.status(200).send('Password successfully updated');
  } catch (err) {
    res.status(500).send('Error resetting password');
  }
};



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
      user_id:user.user_id,
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
const refreshAccessToken = async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).send('Refresh token required');
  }

  try {
    const tokens = await authService.refreshAccessToken(user_id);
    res.json(tokens);
  } catch (err) {
    res.status(401).send('Invalid or expired refresh token');
  }
};

module.exports = { signup, login, getProfile,refreshAccessToken,forgotPassword,resetPassword };

