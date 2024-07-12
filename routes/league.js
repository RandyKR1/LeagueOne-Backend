const express = require('express');
const router = express.Router();
const { League, Team } = require('../models');
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
router.get('/:id', authenticateJWT, ensureLoggedIn, async (req, res) => {
  try {
    const league = await League.findByPk(req.params.id);
    if (league) {
      res.status(200).json(league);
    } else {
      res.status(404).json({ error: 'League not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route POST /leagues/create
 * @description Create a new league
 * @access Logged in users
 */
router.post('/create', authenticateJWT, ensureLoggedIn, async (req, res) => {
  try {
    validateSchema(req.body, schemas.LeagueNew);
    const league = await League.create(req.body);
    res.status(201).json(league);
  } catch (error) {
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
