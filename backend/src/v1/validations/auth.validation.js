const Joi = require('joi');

// Signup Validation Schema
const signupSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    'string.base': 'Username should be a string',
    'string.empty': 'Username is required',
    'string.min': 'Username must be at least 3 characters long',
    'any.required': 'Username is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'A valid email address is required',
    'any.required': 'Email is required',
  }),
  first_name: Joi.string().required().messages({
    'any.required': 'First name is required',
  }),
  last_name: Joi.string().required().messages({
    'any.required': 'Last name is required',
  }),
});

// Login Validation Schema
/*
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'A valid email address is required',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});
*/
module.exports = { signupSchema};
