const express = require('express');
const router = express.Router({ mergeParams: true });
const { Team, Player, Match } = require('../models');
const { validateSchema } = require('../middleware/validateSchema');
const { authenticateJWT, ensureLoggedIn, isTeamAdmin } = require('../middleware/auth');

const schemas = {
  TeamNew: require('../schemas/TeamNew.json'),
  TeamUpdate: require('../schemas/TeamUpdate.json')
};

/**
 * @route GET /teams
 * @description Get all teams
 * @access Private
 */
router.get('/', authenticateJWT, ensureLoggedIn, async (req, res) => {
  try {
    const teams = await Team.findAll();
    res.status(200).json(teams);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route GET /teams/:id
 * @description Get a team by ID
 * @access Private
 */
router.get('/:id', authenticateJWT, ensureLoggedIn, async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (team) {
      res.status(200).json(team);
    } else {
      res.status(404).json({ error: 'Team not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route POST /teams/create
 * @description Create a new team
 * @access Private
 */
router.post('/create', authenticateJWT, ensureLoggedIn, async (req, res) => {
  try {
    validateSchema(req.body, schemas.TeamNew);
    const team = await Team.create(req.body);
    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route POST /teams/:id/join
 * @description Join a team
 * @access Private
 */
router.post('/:id/join', authenticateJWT, ensureLoggedIn, async (req, res) => {
  const { id: teamId } = req.params;
  const { password } = req.body;
  const userId = req.user.id;

  try {
    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Validate team password
    if (!team.validPassword(password)) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Check if the user is already part of the team
    const isMember = await team.hasPlayer(userId);
    if (isMember) {
      return res.status(400).json({ error: 'User is already part of the team' });
    }

    // Add user to the team
    await team.addPlayer(userId);
    res.status(200).json({ message: 'User joined the team successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route PUT /teams/:id
 * @description Update a team
 * @access Private
 */
router.put('/:id', authenticateJWT, ensureLoggedIn, isTeamAdmin, async (req, res) => {
  try {
    validateSchema(req.body, schemas.TeamUpdate);
    const team = await Team.findByPk(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    await team.update(req.body);
    res.status(200).json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route DELETE /teams/:id
 * @description Delete a team
 * @access Private
 */
router.delete('/:id', authenticateJWT, ensureLoggedIn, isTeamAdmin, async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    await team.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route GET /teams/:teamId/matches
 * @description Get all matches for a team
 * @access Private
 */
router.get('/:teamId/matches', authenticateJWT, ensureLoggedIn, async (req, res) => {
  const { teamId } = req.params;
  try {
    const team = await Team.findByPk(teamId, {
      include: [{ model: Match, as: 'matches' }]
    });

    if (team) {
      res.status(200).json(team.matches);
    } else {
      res.status(404).json({ error: 'Team not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
