const express = require("express");
const router = express.Router();
const { User } = require('../models');
const { validateSchema } = require('../middleware/validateSchema');

const schemas = {
    UserNew: require('../schemas/UserNew.json'),
    UserUpdate: require('../schemas/UserUpdate.json'),
    UserSearch: require('../schemas/UserSearch.json')
};

// Get all users (authentication not required)
router.get('/', async (req, res) => {
    try {
        validateSchema(req.query, schemas.UserSearch);
        const users = await User.findAllWithFilters(req.query);
        res.status(200).json(users);
    }catch (error) {
        res.status(400).json({ error: error.message });
    }
  });
  

// Get user by username (authentication not required)
router.get('/:username', async (req, res) => {
    try {
        validateSchema(req.query, schemas.UserSearch);
        const user = await User.findOne({
            where: { username: req.params.username }
        });
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Create a user (authentication not required)
router.post('/create', async (req, res) => {
    try {
        validateSchema(req.body, schemas.UserNew);
        const user = await User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            isAdmin: req.body.isAdmin || false
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update a user (authentication required)
router.put('/:username', async (req, res) => {
    try {
        validateSchema(req.body, schemas.UserUpdate)
        const user = await User.findOne({ where: { username: req.params.username } });
        if (user) {
            await user.update(req.body);
            res.status(200).json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a user (authentication required)
router.delete('/:username', async (req, res) => {
    try {
        const user = await User.findOne({ where: { username: req.params.username } });
        if (user) {
            await user.destroy();
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
