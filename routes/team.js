const express = require('express');
const router = express.Router({ mergeParams: true });
const { Team, Match, User, TeamPlayers } = require('../models');
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
  const teamId = req.params.id;

  try {
    const team = await Team.findByPk(teamId, {
      include: [
        { model: User, as: 'players' }, // Include the players
        { model: User, as: 'admin' },   // Include the admin details
      ],
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/**
 * @route POST /teams/create
 * @description Create a new team
 * @access Private
 */
// Create a new team
router.post('/create', authenticateJWT, ensureLoggedIn, async (req, res) => {
  const { name, password, maxPlayers } = req.body;
  const adminId = req.user.id; // Assuming req.user has the authenticated user's details

  try {
    // Create the team in the database
    const team = await Team.create({
      name,
      password,
      maxPlayers,
      adminId
    });

    // Update the user to mark them as a team admin if not already
    const user = await User.findByPk(adminId);
    if (!user.isTeamAdmin) {
      await user.update({ isTeamAdmin: true });
    }

    // Respond with success message or the created team data
    res.status(201).json({ team });

  } catch (err) {
    console.error('Error creating team:', err);
    res.status(500).json({ error: 'Failed to create team' });
  }
});

/**
 * @route POST /teams/:id/join
 * @description Join a team
 * @access Private
 */
router.post('/:id/join', authenticateJWT, ensureLoggedIn, async (req, res) => {
  const teamId = req.params.id;
  const { password } = req.body;
  const userId = req.user.id; // Assuming you have a middleware that sets req.user

  try {
    const team = await Team.findByPk(teamId, {
      include: [
        { model: User, as: 'players' }, // Include the players
        { model: User, as: 'admin' },   // Optionally include the admin details
      ],
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    if (!team.validPassword(password)) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Check if user is already a player
    const isPlayer = await team.hasPlayer(userId);
    if (isPlayer) {
      return res.status(400).json({ error: 'User already a member of the team' });
    }

    // Add user to the team
    await TeamPlayers.create({ teamId, userId });

    // Fetch the updated list of team members
    const updatedTeam = await Team.findByPk(teamId, {
      include: [
        { model: User, as: 'players' }, // Include the players
        { model: User, as: 'admin' },   // Optionally include the admin details
      ],
    });

    res.json({ message: 'Joined the team successfully', team: updatedTeam });
  } catch (error) {
    res.status(500).json({ error: error.message });
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

/**
 * @route GET /teams/admin/:userId
 * @description Get teams where the user is an admin
 * @access Private
 */
router.get('/admin/:userId', authenticateJWT, ensureLoggedIn, async (req, res) => {
  const userId = req.params.userId;

  try {
    const teams = await Team.findAll({
      where: { adminId: userId },
      include: [{ model: User, as: 'admin' }] // Optionally include admin details
    });

    if (!teams || teams.length === 0) {
      return res.status(404).json({ error: 'No teams found where user is admin' });
    }

    res.status(200).json(teams);
  } catch (error) {
    console.error('Error retrieving teams for admin:', error);
    res.status(500).json({ error: 'Failed to retrieve teams for admin' });
  }
});

module.exports = router;
