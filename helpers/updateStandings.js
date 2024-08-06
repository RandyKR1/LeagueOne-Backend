// Load the required modules
const { Standing } = require('../models');  // Import the Standing model from the models directory

/**
 * Update the standings based on the result of a match.
 * 
 * @param {Object} match - The match object containing match details
 * @param {number} match.team1 - The ID of the first team
 * @param {number} match.team2 - The ID of the second team
 * @param {number} match.team1Score - The score of the first team
 * @param {number} match.team2Score - The score of the second team
 * 
 * @returns {Promise<void>} - A promise that resolves when the standings are updated
 */
const updateStandings = async (match) => {
  const league = await match.getLeague();  // Get the league associated with the match
  const team1Standing = await Standing.findByLeagueAndTeam(league.id, match.team1);  // Get the standing for team1
  const team2Standing = await Standing.findByLeagueAndTeam(league.id, match.team2);  // Get the standing for team2

  // Determine match result and points
  let team1Points = 0;
  let team2Points = 0;
  if (match.team1Score > match.team2Score) {
    team1Points = league.firstPlacePoints;  // Points for winning team1
    team2Points = league.secondPlacePoints; // Points for losing team2
  } else if (match.team1Score < match.team2Score) {
    team1Points = league.secondPlacePoints; // Points for losing team1
    team2Points = league.firstPlacePoints;  // Points for winning team2
  } else {
    team1Points = league.drawPoints;  // Points for draw
    team2Points = league.drawPoints;  // Points for draw
  }

  // Update standings for team1
  if (team1Standing) {
    if (match.team1Score > match.team2Score) {
      await team1Standing.updateRecord(team1Standing.wins + 1, team1Standing.losses, team1Standing.draws);
    } else if (match.team1Score < match.team2Score) {
      await team1Standing.updateRecord(team1Standing.wins, team1Standing.losses + 1, team1Standing.draws);
    } else {
      await team1Standing.updateRecord(team1Standing.wins, team1Standing.losses, team1Standing.draws + 1);
    }
    await team1Standing.updatePoints(team1Standing.points + team1Points);
  }

  // Update standings for team2
  if (team2Standing) {
    if (match.team1Score < match.team2Score) {
      await team2Standing.updateRecord(team2Standing.wins + 1, team2Standing.losses, team2Standing.draws);
    } else if (match.team1Score > match.team2Score) {
      await team2Standing.updateRecord(team2Standing.wins, team2Standing.losses + 1, team2Standing.draws);
    } else {
      await team2Standing.updateRecord(team2Standing.wins, team2Standing.losses, team2Standing.draws + 1);
    }
    await team2Standing.updatePoints(team2Standing.points + team2Points);
  }
};

/**
 * Reverse the standings based on the result of a match.
 * This is used to undo the effects of a match on the standings.
 * 
 * @param {Object} match - The match object containing match details
 * @param {number} match.team1 - The ID of the first team
 * @param {number} match.team2 - The ID of the second team
 * @param {number} match.team1Score - The score of the first team
 * @param {number} match.team2Score - The score of the second team
 * 
 * @returns {Promise<void>} - A promise that resolves when the standings are reversed
 */
const reverseStandings = async (match) => {
  const league = await match.getLeague();  // Get the league associated with the match
  const team1Standing = await Standing.findByLeagueAndTeam(league.id, match.team1);  // Get the standing for team1
  const team2Standing = await Standing.findByLeagueAndTeam(league.id, match.team2);  // Get the standing for team2

  // Determine match result and points to reverse
  let team1Points = 0;
  let team2Points = 0;
  if (match.team1Score > match.team2Score) {
    team1Points = league.firstPlacePoints;  // Points to reverse for team1 win
    team2Points = league.secondPlacePoints; // Points to reverse for team2 loss
  } else if (match.team1Score < match.team2Score) {
    team1Points = league.secondPlacePoints; // Points to reverse for team1 loss
    team2Points = league.firstPlacePoints;  // Points to reverse for team2 win
  } else {
    team1Points = league.drawPoints;  // Points to reverse for draw
    team2Points = league.drawPoints;  // Points to reverse for draw
  }

  // Reverse standings for team1
  if (team1Standing) {
    if (match.team1Score > match.team2Score) {
      await team1Standing.updateRecord(team1Standing.wins - 1, team1Standing.losses, team1Standing.draws);
    } else if (match.team1Score < match.team2Score) {
      await team1Standing.updateRecord(team1Standing.wins, team1Standing.losses - 1, team1Standing.draws);
    } else {
      await team1Standing.updateRecord(team1Standing.wins, team1Standing.losses, team1Standing.draws - 1);
    }
    await team1Standing.updatePoints(team1Standing.points - team1Points);
  }

  // Reverse standings for team2
  if (team2Standing) {
    if (match.team1Score < match.team2Score) {
      await team2Standing.updateRecord(team2Standing.wins - 1, team2Standing.losses, team2Standing.draws);
    } else if (match.team1Score > match.team2Score) {
      await team2Standing.updateRecord(team2Standing.wins, team2Standing.losses - 1, team2Standing.draws);
    } else {
      await team2Standing.updateRecord(team2Standing.wins, team2Standing.losses, team2Standing.draws - 1);
    }
    await team2Standing.updatePoints(team2Standing.points - team2Points);
  }
};

module.exports = {
  updateStandings,  // Export the updateStandings function for use in other parts of the application
  reverseStandings  // Export the reverseStandings function for use in other parts of the application
};
