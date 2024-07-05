const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { loginUser } = require('../utilities/auth')

// User registration
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const user = await User.create({ firstName, lastName, email, username, password: hashedPassword });
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// User login
router.post('/login', loginUser);

module.exports = router;
