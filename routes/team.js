const express = require("express");
const router = express.Router();
const { Team, User } = require('../models');
const { authenticateToken, isTeamAdmin } = require('../utilities/auth'); // Import authenticateToken and isTeamAdmin from auth.js

// Get all teams
router.get('/', async (req, res) => {
  try {
    const teams = await Team.findAllWithFilters(req.query);
    res.status(200).json(teams);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get team by ID
router.get('/:id', async (req, res) => {
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

// Create a team
router.post('/create', async (req, res) => {
  try {
    const { name, password, maxPlayers, league } = req.body;
    
    // Find the logged-in user
    const loggedInUser = req.user;

    // Create the team
    const team = await Team.create({
      name,
      password,
      maxPlayers,
      league,
      adminId: loggedInUser.id
    });

    // Add admin as a player in the team
    await team.addPlayer(loggedInUser);

    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// User joins a team
router.post('/:teamId/join', async (req, res) => {
    const { teamId } = req.params;
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
  
      // Add user to team's players
      await team.addPlayer(userId);
      res.status(200).json({ message: 'User joined the team successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

// Update a team
router.put('/:id', async (req, res) => {
  try {
    const team = req.team; // Access team object attached by isTeamAdmin middleware

    // Update the team (assuming req.body contains updated fields)
    await team.update(req.body);

    res.status(200).json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a team
router.delete('/:id', async (req, res) => {
  try {
    const team = req.team; // Access team object attached by isTeamAdmin middleware

    // Delete the team
    await team.destroy();

    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
