const express = require('express');
const router = express.Router({ mergeParams: true });
const { Match, League } = require('../models');
const { validateSchema } = require('../middleware/validateSchema');

const schemas = {
  MatchNew: require('../schemas/MatchNew.json'),
  MatchUpdate: require('../schemas/MatchUpdate.json'),
  MatchSearch: require('../schemas/MatchSearch.json')
};

// routes/match.js

// Get all matches for a league
router.get('/', async (req, res) => {
  try{
  const { leagueId } = req.params;
  const matches = await Match.findAllWithFilters({ ...req.query, leagueId: parseInt(leagueId) });
  res.status(200).json(matches);
  }catch(e){
    return res.status(404).json({ error: e.message });
  }
});


router.get('/:matchId', async (req, res) => {
  try {
    const { leagueId, matchId } = req.params;
    const match = await Match.findOne({
      where: {
        id: parseInt(matchId),
        leagueId: parseInt(leagueId)
      }
    });
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    res.status(200).json(match);
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
});


// Create a new match
router.post('/create', async (req, res) => {
  try {
      const { leagueId } = req.params;
      console.log("Received leagueId:", leagueId);
      const { eventName, eventLocation, eventType, eventResults, creatorId } = req.body;
      console.log("Received data:", req.body);

      if (!leagueId || !eventName || !eventLocation || !eventType || !creatorId) {
          return res.status(400).json({ error: "Missing required fields" });
      }

      const newMatch = await Match.create({
          leagueId: parseInt(leagueId, 10),
          eventName,
          eventLocation,
          eventType,
          eventResults,
          creatorId: parseInt(creatorId, 10)
      });

      return res.status(201).json(newMatch);
  } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
  }
});

// Update match
router.put('/:matchId', async (req, res) => {
  const { leagueId, matchId } = req.params;
  const { eventName, eventLocation, eventType, eventResults, creatorId } = req.body;

  try {
    // Find the match by leagueId and matchId
    const match = await Match.findOne({
      where: {
        id: matchId,
        leagueId: leagueId,
      },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Update match attributes
    match.eventName = eventName;
    match.eventLocation = eventLocation;
    match.eventType = eventType;
    match.eventResults = eventResults;
    match.creatorId = creatorId;

    // Save the updated match
    await match.save();

    // Respond with updated match data
    return res.json(match);
  } catch (error) {
    console.error('Error updating match:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
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
