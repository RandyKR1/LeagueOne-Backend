const express = require('express');
const router = express.Router();
const { League, User, Team, Match } = require('../models');
const { validateSchema } = require('../middleware/validateSchema');


const schemas = {
  LeagueNew: require('../schemas/LeagueNew.json'),
  LeagueUpdate: require('../schemas/LeagueUpdate.json'),
  LeagueSearch: require('../schemas/LeagueSearch.json')
};

// Get all leagues
router.get('/', async (req, res) => {
  try {
    validateSchema(req.query, schemas.LeagueSearch);
    const leagues = await League.findAllWithFilters(req.query);
    res.status(200).json(leagues);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get league by ID
router.get('/:id', async (req, res) => {
  try {
    validateSchema(req.query, schemas.LeagueSearch);
    const league = await League.findByPk(req.params.id, {
      include: [
        { model: Team, as: 'teams' }, 
        { model: User, as: 'members' },
        { model: Match, as: 'matches'}
    ]
    });
    if (league) {
      res.status(200).json(league);
    } else {
      res.status(404).json({ error: 'League not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create a league
router.post('/create', async (req, res) => {
  try {
    validateSchema(req.body, schemas.LeagueNew)
    const { name, password, maxTeams, description } = req.body;
    // const loggedInUser = req.user;

    // if (!loggedInUser) {
    //     return res.status(403).json({ error: 'User not authenticated', loggedInUser });
    //   }

    const league = await League.create({
      name,
      password,
      maxTeams,
      description,
    //   adminId: loggedInUser.id,
    });

    // Add admin as a member of the league
    // await league.addMember(loggedInUser);

    res.status(201).json(league);
  } catch (error) {
    res.status(400).json({ error: error.message, loggedInUser });
  }
});


// Team admin joins a league
router.post('/:leagueId/join', async (req, res) => {
    const { leagueId } = req.params;
    const { teamId, password } = req.body; // The team ID and password should be provided in the request body
  
    try {
      const league = await League.findByPk(leagueId);
      if (!league) {
        return res.status(404).json({ error: 'League not found' });
      }
  
      // Validate league password
      if (!league.validPassword(password)) {
        return res.status(401).json({ error: 'Incorrect password' });
      }
  
      const team = await Team.findByPk(teamId);
      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }
  
      // Check if the team is already part of a league
      if (team.leagueId) {
        return res.status(400).json({ error: 'Team is already part of a league' });
      }
  
      // Add team to the league
      team.leagueId = leagueId;
      await team.save();
  
      res.status(200).json({ message: 'Team joined the league successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

// Update a league
router.put('/:id', async (req, res) => {
  try {
    validateSchema(req.body, schemas.LeagueUpdate)
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

// Delete a league
router.delete('/:id', async (req, res) => {
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
