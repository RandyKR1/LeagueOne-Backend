const express = require('express');
const router = express.Router();
const { League, Team, User, Match , Standing, TeamLeagues} = require('../models');
const { validateSchema } = require('../middleware/validateSchema');
const { authenticateJWT, ensureLoggedIn, isLeagueAdmin, isTeamAdminForLeagueJoin } = require('../middleware/auth');

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
    const leagues = await League.findAll({
      include: [
        { model: User, as: 'admin', attributes: ['firstName', 'lastName', 'username'] },
      ]}
    );
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
        { model: User, as: 'admin', attributes: ['id', 'firstName', 'lastName', 'username'] },
        { model: Match, as: 'matches' },
        { model: Team, as: 'teams'}
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
      where: { leagueId: id }, 
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
  const { teamId, password } = req.body;

  try {
    // Check if the league exists
    const league = await League.findByPk(leagueId);
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }

    // Check if the password is correct
    if (!league.validPassword(password)) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Check if the team exists
    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if the team is already a member of the league
    const isMember = await league.hasTeam(teamId);
    if (isMember) {
      return res.status(400).json({ error: 'Team is already a member of the league' });
    }

    // Check if adding this team would exceed the maximum allowed teams
    const currentTeamCount = await league.getNumberOfTeams();
    if (league.maxTeams && currentTeamCount >= league.maxTeams) {
      return res.status(400).json({ error: 'League has reached the maximum number of teams' });
    }

    // Add the team to the league and create standings
    await league.addTeam(team);
    const [standing, created] = await Standing.findOrCreate({
      where: { leagueId, teamId },
      defaults: { points: 0, wins: 0, losses: 0, draws: 0 }
    });

    if (!created) {
      return res.status(400).json({ error: 'Standings already exist for this team in this league' });
    }

    res.json({ message: 'Team joined the league successfully', league });
  } catch (error) {
    console.error('Error joining league:', error);
    res.status(500).json({ error: 'Unable to join due to backend issue in league.js' });
  }
});

/**
 * @route POST /leagues/:id/leave
 * @description Team admin leaves a league
 * @access Team admins
 */
router.post('/:id/leave', authenticateJWT, ensureLoggedIn, async (req, res) => {
  const leagueId = req.params.id;
  const { teamId } = req.body;

  try {
    const league = await League.findByPk(leagueId);
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }

    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if the team is a member of the league
    const isMember = await league.hasTeam(teamId);
    if (!isMember) {
      return res.status(400).json({ error: 'Team is not a member of the league' });
    }

    // Remove the team from the league
    await league.removeTeam(teamId);

    // Optionally, you might want to delete standings or handle related data
    await Standing.destroy({ where: { leagueId, teamId } });

    res.json({ message: 'Team left the league successfully' });
  } catch (error) {
    console.error('Error leaving league:', error);
    res.status(500).json({ error: 'Unable to leave the league due to a backend issue' });
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
 * @route DELETE /leagues/:id/teams/:teamId
 * @description Remove a team from a league (Admin action)
 * @access League admins
 */
router.delete('/:id/remove/:teamLeaguesId', authenticateJWT, ensureLoggedIn, isLeagueAdmin, async (req, res) => {
  const leagueId = req.params.id;
  const teamLeaguesId = req.params.teamLeaguesId;

  try {
    // Fetch the TeamLeagues entry to get the teamId
    const teamLeaguesEntry = await TeamLeagues.findByPk(teamLeaguesId);
    if (!teamLeaguesEntry) {
      return res.status(404).json({ error: 'TeamLeagues entry not found' });
    }

    const teamId = teamLeaguesEntry.teamId;
    const league = await League.findByPk(leagueId);
    const team = await Team.findByPk(teamId);

    if (!league || !team) {
      return res.status(404).json({ error: 'League or Team not found' });
    }

    // Remove the team from the league using the TeamLeagues ID
    await TeamLeagues.destroy({ where: { id: teamLeaguesId } });

    // Optionally, delete related data like standings
    await Standing.destroy({ where: { leagueId, teamId } });

    res.json({ message: 'Team removed from the league successfully' });
  } catch (error) {
    console.error('Error removing team from league:', error);
    res.status(500).json({ error: 'Unable to remove team due to a backend issue' });
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
