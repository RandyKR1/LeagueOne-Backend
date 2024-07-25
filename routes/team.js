const express = require('express');
const router = express.Router({ mergeParams: true });
const { Team, Standing, Match, User, TeamPlayers, League, sequelize } = require('../models');
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
    const teams = await Team.findAll({
      include: [
        { model: User, as: 'players', attributes: ['id', 'firstName', 'lastName', 'username']  }, 
        { model: User, as: 'admin', attributes: ['id', 'firstName', 'lastName', 'username']  },
      ]});
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
        { model: User, as: 'players', attributes: ['id', 'firstName', 'lastName', 'username']  }, 
        { model: User, as: 'admin', attributes: ['id', 'firstName', 'lastName', 'username']  },   
        { model: League, as: 'leagues', attributes: ['id', 'name'] }
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
 * @route POST /teams/:id/leave
 * @description Leave a team
 * @access Private
 */
router.post('/:id/leave', authenticateJWT, ensureLoggedIn, async (req, res) => {
  const teamId = req.params.id;
  const userId = req.user.id; // Get the ID of the logged-in user

  try {
      const team = await Team.findByPk(teamId);
      if (!team) {
          return res.status(404).json({ error: 'Team not found' });
      }

      // Check if user is a player in the team
      const isPlayer = await team.hasPlayer(userId);
      if (!isPlayer) {
          return res.status(400).json({ error: 'User is not a member of the team' });
      }

      // Remove user from the team
      await TeamPlayers.destroy({ where: { teamId, userId } });

      // Fetch the updated team data
      const updatedTeam = await Team.findByPk(teamId, {
          include: [{ model: User, as: 'players' }]
      });

      res.json({ message: 'Left the team successfully', team: updatedTeam });
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

router.delete('/:id', authenticateJWT, ensureLoggedIn, isTeamAdmin, async (req, res) => {
  const teamId = req.params.id;
  const transaction = await sequelize.transaction();
  
  try {
    const team = await Team.findByPk(teamId, { transaction });
    if (!team) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Team not found' });
    }

    await Standing.destroy({ where: { teamId }, transaction });
    await team.destroy({ transaction });

    await transaction.commit();
    res.status(204).send();
  } catch (error) {
    await transaction.rollback();
    console.error('Error deleting team:', error.message);
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route DELETE /teams/:teamId/players/:userId
 * @description Remove a player from a team (admin only)
 * @access Private
 */
router.delete('/:teamId/players/:userId', authenticateJWT, ensureLoggedIn, isTeamAdmin, async (req, res) => {
    const { teamId, userId } = req.params;

    try {
        const team = await Team.findByPk(teamId, {
            include: [
                { model: User, as: 'players', where: { id: userId } } // Check if the user is a player
            ]
        });

        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Check if user is a player in the team
        if (team.players.length === 0) {
            return res.status(400).json({ error: 'User is not a member of the team' });
        }

        // Remove the player from the team
        await TeamPlayers.destroy({ where: { teamId, userId } });

        // Respond with success message
        res.status(200).json({ message: 'Player removed successfully' });
    } catch (error) {
        console.error("Error removing player:", error);
        res.status(500).json({ error: 'Failed to remove player' });
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
