const { Team } = require('../models');

async function updateStandings(match) {
  const results = match.eventResults;
  for (const result of results) {
    const team = await Team.findByPk(result.teamId);
    if (team) {
      team.wins += result.wins;
      team.losses += result.losses;
      team.ties += result.ties;
      await team.save();
    }
  }
}

module.exports = updateStandings;
