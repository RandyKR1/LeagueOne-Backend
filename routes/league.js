const express = require('express');
const router = express.Router();
const { League, Team, User, Match } = require('../models');
const { validateSchema } = require('../middleware/validateSchema');
const { authenticateJWT, ensureLoggedIn, isLeagueAdmin, isTeamAdmin } = require('../middleware/auth');

const schemas = {
  LeagueNew: require('../schemas/LeagueNew.json'),
  LeagueUpdate: require('../schemas/LeagueUpdate.json')
};

/**
 * @route GET /leagues
 * @description Get all leagues
 * @access Logged in users
 */
router.get('/', authenticateJWT, ensureLoggedIn, async (req, res) => {
  try {
    const leagues = await League.findAll();
    res.status(200).json(leagues);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route GET /leagues/:id
 * @description Get league by ID
 * @access Logged in users
 */
router.get('/:id', async (req, res, next) => {
  try {
    const league = await League.findByPk(req.params.id, {
      include: [
        { model: User, as: 'admin', attributes: ['id', 'firstName'] },
        { model: Match, as: 'matches' }
      ]
    });
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }
    res.json(league);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /leagues/create
 * @description Create a new league and add currentUser as LeagueAdmin
 * @access Logged in users
 */
router.post('/create', authenticateJWT, ensureLoggedIn, async (req, res) => {
  try {
    validateSchema(req.body, schemas.LeagueNew);
    const { name, password, maxTeams, description } = req.body;
    const adminId = req.user.id;  // Get the ID of the user making the request

    const league = await League.create({
      name,
      password,
      maxTeams,
      description,
      adminId
    });

    await league.addMember(adminId);

    // Set the user as league admin
    const user = await User.findByPk(adminId);
    user.isLeagueAdmin = true;
    await user.save();

    res.status(201).json(league);
  } catch (error) {
    console.error("Error creating league:", error);
    res.status(400).json({ error: error.message });
  }
});


/**
 * @route POST /leagues/:id/join
 * @description Team admin joins a league
 * @access Team admins
 */
router.post('/:id/join', authenticateJWT, ensureLoggedIn, isTeamAdmin, async (req, res) => {
  const { teamId } = req.body;
  const leagueId = req.params.id;
  const userId = req.user.id;

  try {
    const league = await League.findByPk(leagueId);
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }

    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if the user is already part of the league
    const isMember = await league.hasTeam(teamId);
    if (isMember) {
      return res.status(400).json({ error: 'Team is already part of the league' });
    }

    // Add team to the league
    await league.addTeam(teamId);
    res.status(200).json({ message: 'Team joined the league successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route PUT /leagues/:id
 * @description Update a league
 * @access League admins
 */
router.put('/:id', authenticateJWT, ensureLoggedIn, isLeagueAdmin, async (req, res) => {
  try {
    validateSchema(req.body, schemas.LeagueUpdate);
    const league = await League.findByPk(req.params.id);
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }

    await league.update(req.body);
    res.status(200).json(league);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route DELETE /leagues/:id
 * @description Delete a league
 * @access League admins
 */
router.delete('/:id', authenticateJWT, ensureLoggedIn, isLeagueAdmin, async (req, res) => {
  try {
    const league = await League.findByPk(req.params.id);
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }

    await league.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
