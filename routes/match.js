const express = require('express');
const router = express.Router({ mergeParams: true });
const { Match, League, Team, Standing } = require('../models');
const { validateSchema } = require('../middleware/validateSchema');
const { authenticateJWT, ensureLoggedIn, isLeagueAdmin } = require('../middleware/auth');

const schemas = {
  MatchNew: require('../schemas/MatchNew.json'),
  MatchUpdate: require('../schemas/MatchUpdate.json')
};

/**
 * @route GET /leagues/:leagueId/matches
 * @description Get all matches for a league
 * @access Logged in users
 */
router.get('/', authenticateJWT, ensureLoggedIn, async (req, res) => {
  const { leagueId } = req.params;
  try {
    const league = await League.findByPk(leagueId, {
      include: [{
        model: Match,
        as: 'matches',
        include: [
          { model: Team, as: 'homeTeam', attributes: ['id', 'name'] },
          { model: Team, as: 'awayTeam', attributes: ['id', 'name'] },
        ],
        attributes: ['id', 'leagueId', 'eventType', 'eventLocation', 'team1', 'team2', 'team1Score', 'team2Score'],
      }],
    });

    if (league) {
      res.status(200).json(league.matches);
    } else {
      res.status(404).json({ error: 'League not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route GET /leagues/:leagueId/matches/:matchId
 * @description Get match by ID
 * @access Logged in users
 */
router.get('/:matchId', authenticateJWT, ensureLoggedIn, async (req, res) => {
  const { leagueId, matchId } = req.params;
  try {
    const match = await Match.findOne({
      where: { id: matchId, leagueId },
      include: [
        { model: Team, as: 'homeTeam', attributes: ['id', 'name'] },
        { model: Team, as: 'awayTeam', attributes: ['id', 'name'] },
        { model: League, as: 'league', attributes: ['adminId', 'name']},
      ],
      attributes: ['id', 'leagueId', 'eventType', 'eventLocation', 'team1', 'team2', 'team1Score', 'team2Score'],
    });

    if (match) {
      res.status(200).json(match);
    } else {
      res.status(404).json({ error: 'Match not found' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route POST /leagues/:leagueId/matches/create
 * @description Create a new match
 * @access League admins
 */
router.post('/create', authenticateJWT, ensureLoggedIn, isLeagueAdmin, async (req, res) => {
  const { leagueId } = req.params;
  try {
    validateSchema(req.body, schemas.MatchNew);

    const { eventLocation, eventType, eventResults, team1, team2, team1Score, team2Score } = req.body;

    if (team1 === team2) {
      return res.status(400).json({ error: 'A team cannot play against itself' });
    }

    // Create the match
    const match = await Match.create({
      leagueId,
      eventType,
      eventLocation,
      eventResults,
      team1,
      team2,
      team1Score,
      team2Score
    });

    // Get the league instance
    const league = await League.findByPk(leagueId);
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }

    res.status(201).json({match});
  } catch (error) {
    console.error(error); // Log the error for debugging purposes
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route PUT /leagues/:leagueId/matches/:matchId
 * @description Update a match
 * @access League admins
 */
router.put('/:matchId', authenticateJWT, ensureLoggedIn, isLeagueAdmin, async (req, res) => {
  const { leagueId, matchId } = req.params;
  try {
    validateSchema(req.body, schemas.MatchUpdate);
    const match = await Match.findOne({
      where: { id: matchId, leagueId }
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    await match.update(req.body);

    res.status(200).json(match);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @route DELETE /leagues/:leagueId/matches/:matchId
 * @description Delete a match
 * @access League admins
 */
router.delete('/:matchId', authenticateJWT, ensureLoggedIn, isLeagueAdmin, async (req, res) => {
  const { leagueId, matchId } = req.params;

  try {
    // Parse IDs and validate
    const leagueIdInt = parseInt(leagueId, 10);
    const matchIdInt = parseInt(matchId, 10);

    if (isNaN(leagueIdInt) || isNaN(matchIdInt)) {
      return res.status(400).json({ error: 'Invalid leagueId or matchId' });
    }

    // Fetch the match
    const match = await Match.findOne({
      where: { id: matchIdInt, leagueId: leagueIdInt },
      include: [
        { model: Team, as: 'homeTeam' },
        { model: Team, as: 'awayTeam' },
      ],
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Fetch standings
    const homeTeamStanding = await Standing.findByLeagueAndTeam(leagueIdInt, match.homeTeam.id);
    const awayTeamStanding = await Standing.findByLeagueAndTeam(leagueIdInt, match.awayTeam.id);

    if (!homeTeamStanding || !awayTeamStanding) {
      return res.status(404).json({ error: 'Standings not found for one or both teams' });
    }

    // Helper function to ensure integer values
    const ensureInteger = (value) => (isNaN(value) ? 0 : value);

    // Reverse the impact of the match results
    if (match.team1Score > match.team2Score) {
      // Home team won
      await homeTeamStanding.updateRecord(
        ensureInteger(homeTeamStanding.wins - 1),
        ensureInteger(homeTeamStanding.losses),
        ensureInteger(homeTeamStanding.draws)
      );
      await homeTeamStanding.updatePoints(ensureInteger(homeTeamStanding.points - match.firstPlacePoints));
      
      await awayTeamStanding.updateRecord(
        ensureInteger(awayTeamStanding.wins),
        ensureInteger(awayTeamStanding.losses - 1),
        ensureInteger(awayTeamStanding.draws)
      );
      await awayTeamStanding.updatePoints(ensureInteger(awayTeamStanding.points));
      
    } else if (match.team1Score < match.team2Score) {
      // Away team won
      await homeTeamStanding.updateRecord(
        ensureInteger(homeTeamStanding.wins),
        ensureInteger(homeTeamStanding.losses - 1),
        ensureInteger(homeTeamStanding.draws)
      );
      await homeTeamStanding.updatePoints(ensureInteger(homeTeamStanding.points));
      
      await awayTeamStanding.updateRecord(
        ensureInteger(awayTeamStanding.wins - 1),
        ensureInteger(awayTeamStanding.losses),
        ensureInteger(awayTeamStanding.draws)
      );
      await awayTeamStanding.updatePoints(ensureInteger(awayTeamStanding.points - match.firstPlacePoints));
      
    } else {
      // Draw
      await homeTeamStanding.updateRecord(
        ensureInteger(homeTeamStanding.wins),
        ensureInteger(homeTeamStanding.losses),
        ensureInteger(homeTeamStanding.draws - 1)
      );
      await homeTeamStanding.updatePoints(ensureInteger(homeTeamStanding.points - match.drawPoints));
      
      await awayTeamStanding.updateRecord(
        ensureInteger(awayTeamStanding.wins),
        ensureInteger(awayTeamStanding.losses),
        ensureInteger(awayTeamStanding.draws - 1)
      );
      await awayTeamStanding.updatePoints(ensureInteger(awayTeamStanding.points - match.drawPoints));
    }

    // Delete the match
    await match.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(400).json({ error: error.message });
  }
});


module.exports = router;
