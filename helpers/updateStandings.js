// helpers/updateStandings.js

const { Standing } = require('../models');

const updateStandings = async (match) => {
  const league = await match.getLeague();
  const team1Standing = await Standing.findByLeagueAndTeam(league.id, match.team1);
  const team2Standing = await Standing.findByLeagueAndTeam(league.id, match.team2);

  // Determine match result and points
  let team1Points = 0;
  let team2Points = 0;
  if (match.team1Score > match.team2Score) {
    team1Points = league.firstPlacePoints;
    team2Points = league.secondPlacePoints;
  } else if (match.team1Score < match.team2Score) {
    team1Points = league.secondPlacePoints;
    team2Points = league.firstPlacePoints;
  } else {
    team1Points = league.drawPoints;
    team2Points = league.drawPoints;
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

const reverseStandings = async (match) => {
  const league = await match.getLeague();
  const team1Standing = await Standing.findByLeagueAndTeam(league.id, match.team1);
  const team2Standing = await Standing.findByLeagueAndTeam(league.id, match.team2);

  // Determine match result and points to reverse
  let team1Points = 0;
  let team2Points = 0;
  if (match.team1Score > match.team2Score) {
    team1Points = league.firstPlacePoints;
    team2Points = league.secondPlacePoints;
  } else if (match.team1Score < match.team2Score) {
    team1Points = league.secondPlacePoints;
    team2Points = league.firstPlacePoints;
  } else {
    team1Points = league.drawPoints;
    team2Points = league.drawPoints;
  }

  // Reverse standings for team1
  if (team1Standing) {
    if (match.team1Score > match.team2Score) {
      await team1Standing.updateRecord(team1Standing.wins - 1, team1Standing.losses, team1Standing.draws);
    } else if (match.team1Score < match.team2Score) {
      await team1Standing.updateRecord(team1Standing.wins, team1Standing.losses + 1, team1Standing.draws);
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
      await team2Standing.updateRecord(team2Standing.wins, team2Standing.losses + 1, team2Standing.draws);
    } else {
      await team2Standing.updateRecord(team2Standing.wins, team2Standing.losses, team2Standing.draws - 1);
    }
    await team2Standing.updatePoints(team2Standing.points - team2Points);
  }
};

module.exports = {
  updateStandings,
  reverseStandings
};
