const express = require('express');
const router = express.Router();
const { League, Team, User, Match , Standing} = require('../models');
const { validateSchema } = require('../middleware/validateSchema');
const { authenticateJWT, ensureLoggedIn, isLeagueAdmin, isTeamAdmin, isTeamAdminForLeagueJoin } = require('../middleware/auth');

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
        { model: Match, as: 'matches' },
        {model: Team, as: 'teams'}
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
 * @route GET /leagues/standings
 * @description get team standings for league based on id
 * @access Logged in users
 */
router.get('/:id/standings', async (req, res) => {
  const { id } = req.params;
  try {
    const standings = await Standing.findAll({
      where: { leagueId: id }, // Corrected to use leagueId instead of id
      include: [{ model: Team, as: 'team' }], // Ensure this matches your model associations
    });
    res.json(standings);
  } catch (error) {
    console.error('Error fetching standings:', error); // Add logging
    res.status(500).json({ error: 'Failed to fetch standings' });
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
    const { name, password, maxTeams, competition, description, firstPlacePoints, secondPlacePoints, drawPoints } = req.body;
    const adminId = req.user.id;  // Get the ID of the user making the request

    const league = await League.create({
      name,
      password,
      maxTeams,
      competition,
      description,
      adminId,
      firstPlacePoints,
      secondPlacePoints,
      drawPoints
    });

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
router.post('/:id/join', authenticateJWT, ensureLoggedIn, isTeamAdminForLeagueJoin, async (req, res) => {
  const leagueId = req.params.id;
  const { teamId } = req.body;

  try {
    console.log(`Joining league: ${leagueId} with team: ${teamId}`);

    // Check if the league exists
    const league = await League.findByPk(leagueId);
    if (!league) {
      console.error(`League not found: ${leagueId}`);
      return res.status(404).json({ error: 'League not found' });
    }

    // Check if the team exists
    const team = await Team.findByPk(teamId);
    if (!team) {
      console.error(`Team not found: ${teamId}`);
      return res.status(404).json({ error: 'Team not found' });
    }

    const isMember = await league.hasTeam(teamId);
    if (isMember) {
      console.error(`Team is already a member of the league: ${teamId}`);
      return res.status(400).json({ error: 'Team is already a member of the league' });
    }

    await league.addTeam(team);
    await Standing.create({ leagueId, teamId, points: 0, wins: 0, losses: 0, draws: 0 });

    res.json({ message: 'Team joined the league successfully', league });
  } catch (error) {
    console.error('Error joining league:', error);
    res.status(500).json({ error: 'Unable to join due to backend issue in league.js' });
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
