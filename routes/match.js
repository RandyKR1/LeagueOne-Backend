const express = require('express');
const router = express.Router({ mergeParams: true });
const { Match, League } = require('../models');
const { authenticateToken, isLeagueAdmin } = require('../utilities/auth');

// Get all matches for a league
router.get('/', async (req, res) => {
  try {
    const matches = await Match.findAllWithFilters(req.query);
    res.status(200).json(matches);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Create a new match
router.post('/create', async (req, res) => {
  const { leagueId } = req.params;
  const { eventName, eventLocation, eventParticipants, eventType, eventResults } = req.body;
  const userId = req.user.id;

  try {
    const league = await League.findByPk(leagueId);
    if (!league) {
      return res.status(404).json({ error: 'League not found' });
    }

    const match = await Match.create({
      leagueId,
      eventName,
      eventLocation,
      eventParticipants,
      eventType,
      eventResults,
      creatorId: userId,
    });

    res.status(201).json(match);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a match
router.put('/:matchId', async (req, res) => {
  const { leagueId, matchId } = req.params;

  try {
    const match = await Match.findOne({ where: { id: matchId, leagueId } });
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    await match.update(req.body);
    res.status(200).json(match);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a match
router.delete('/:matchId', async (req, res) => {
  const { leagueId, matchId } = req.params;

  try {
    const match = await Match.findOne({ where: { id: matchId, leagueId } });
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    await match.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
