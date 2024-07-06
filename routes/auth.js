const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const {generateToken} = require('../middleware/auth')
const { User } = require('../models');
const { validateSchema } = require('../middleware/validateSchema')


const schemas = {
    UserRegister: require('../schemas/UserRegister.json'),
    UserAuth: require('../schemas/UserAuth.json'),
  };

// User registration
router.post('/register', async (req, res) => {
    try {

        //schema validation
        validateSchema(req.body, schemas.UserRegister);

        const { firstName, lastName, email, username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
        const user = await User.create({ firstName, lastName, email, username, password: hashedPassword });
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// User login
router.post('/login', async (req, res)=> {
    const { username, password } = req.body;
  
    try {

        validateSchema(req.body, schemas.UserAuth);

        // Find user by username
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
  
           // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password); // Await bcrypt.compare
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Incorrect Password' });
        }
  
      // Generate JWT token
      const token = generateToken(user);
  
      res.json({ token });
    } catch (error) {
        if (error.message.startsWith('Invalid request data')) {
            return res.status(400).json({ error: 'Validation Error', details: JSON.parse(error.message.slice(21)) });
        }
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
