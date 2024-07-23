const express = require('express');
const router = express.Router();
const { User, Team, League } = require('../models');
const { validateSchema } = require('../middleware/validateSchema');
const { authenticateJWT, ensureLoggedIn } = require('../middleware/auth');
const team = require('../models/team');

const schemas = {
  UserNew: require('../schemas/UserNew.json'),
  UserUpdate: require('../schemas/UserUpdate.json'),
  UserSearch: require('../schemas/UserSearch.json'),
};

/**
 * @route GET /users
 * @description Get all users with optional filters
 * @access Private
 */
router.get('/', authenticateJWT, ensureLoggedIn, async (req, res) => {
  try {
    validateSchema(req.query, schemas.UserSearch);
    const users = await User.findAllWithFilters(req.query);
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route GET /users/:username
 * @description Get a user by username
 * @access Private
 */
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ 
      where: { username: req.params.username },
      include: [
        {model: Team, as: 'teams',
          include: [{ model: League, as: 'leagues' }]},
        { model: Team, as: 'administeredTeams' },
        { model: League, as: 'administeredLeagues' }
      ]
    });

    if (user) {
      // Collect all unique leagues the user is a part of through their teams
      const leaguesFromTeams = user.teams.flatMap(team => team.leagues || []);
      // Remove duplicates by creating a Set with league IDs
      const uniqueLeagues = Array.from(new Set(leaguesFromTeams.map(league => league.id)))
        .map(id => leaguesFromTeams.find(league => league.id === id));

      // Add unique leagues to the user object
      user.dataValues.uniqueLeagues = uniqueLeagues;

      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


/**
 * @route PUT /users/:username
 * @description Update a user by username
 * @access Private
 */
router.put('/:username', authenticateJWT, ensureLoggedIn, async (req, res) => {
  try {
    validateSchema(req.body, schemas.UserUpdate);
    const user = await User.findOne({ where: { username: req.params.username } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update(req.body);
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route DELETE /users/:username
 * @description Delete a user by username
 * @access Private
 */
router.delete('/:username', authenticateJWT, ensureLoggedIn, async (req, res) => {
  try {
    const user = await User.findOne({ where: { username: req.params.username } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
