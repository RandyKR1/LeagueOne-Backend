const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { BadRequestError, UnauthorizedError } = require('../expressError');
const { createToken } = require('../helpers/tokens');

/**
 * @route POST /auth/register
 * @description Register a new user
 * @access Public
 */
router.post('/register', async (req, res, next) => {
  try {
    const { username, password, firstName, lastName, email, isAdmin } = req.body;
    
    // Check if username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const newUser = await User.create({ username, password, firstName, lastName, email, isAdmin });
    res.status(201).json(newUser);
  } catch (error) {
    next(error); // Pass error to error handler middleware
  }
});

/**
 * @route POST /auth/token
 * @description Authenticate a user and return a JWT token
 * @access Public
 */
router.post('/token', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ where: { username } });
    console.log("/token:", username);
    if (!user) {
      throw new UnauthorizedError('Invalid username/password');
    }

    // Compare hashed password with input password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid username/password');
    }

    // Generate JWT token
    const token = createToken(user);

    res.json({ token });
  } catch (error) {
    next(error); // Pass error to error handler middleware
  }
});

module.exports = router;
