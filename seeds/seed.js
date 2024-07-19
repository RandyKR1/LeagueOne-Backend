const bcrypt = require('bcrypt');
const { User, Team, League, Match } = require('../models'); // Adjust path based on your project structure

const seedData = async () => {
  try {
    // Clear existing data
    await User.destroy({ where: {} });
    await Team.destroy({ where: {} });
    await League.destroy({ where: {} });
    await Match.destroy({ where: {} });

    // Create Users
    const users = await User.bulkCreate([
      { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', username: 'johndoe', password: '123456', isLeagueAdmin: true },
      { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', username: 'janesmith', password: '123456', isTeamAdmin: true },
      { firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@example.com', username: 'alicejohnson', password: '123456', isLeagueAdmin: false },
      { firstName: 'Bob', lastName: 'Williams', email: 'bob.williams@example.com', username: 'bobwilliams', password: '123456', isTeamAdmin: false },
      { firstName: 'Charlie', lastName: 'Brown', email: 'charlie.brown@example.com', username: 'charliebrown', password: '123456', isLeagueAdmin: true },
      { firstName: 'Daisy', lastName: 'Miller', email: 'daisy.miller@example.com', username: 'daisymiller', password: '123456', isTeamAdmin: true }
    ], { returning: true });

    const [john, jane, alice, bob, charlie, daisy] = users;

    // Create Leagues
    const leagues = await League.bulkCreate([
      { name: 'Premier League', password: '123456', maxTeams: 20, competition: 'Soccer', description: 'Top soccer league in the country', adminId: john.id, firstPlacePoints: 3, secondPlacePoints: 1, drawPoints: 1 },
      { name: 'NBA', password: '123456', maxTeams: 30, competition: 'Basketball', description: 'Top basketball league in the country', adminId: jane.id, firstPlacePoints: 2, secondPlacePoints: 1, drawPoints: 0 },
      { name: 'La Liga', password: '123456', maxTeams: 20, competition: 'Soccer', description: 'Top soccer league in Spain', adminId: alice.id, firstPlacePoints: 3, secondPlacePoints: 1, drawPoints: 1 },
      { name: 'Serie A', password: '123456', maxTeams: 20, competition: 'Soccer', description: 'Top soccer league in Italy', adminId: bob.id, firstPlacePoints: 3, secondPlacePoints: 1, drawPoints: 1 },
      { name: 'MLS', password: '123456', maxTeams: 28, competition: 'Soccer', description: 'Major League Soccer in the US', adminId: charlie.id, firstPlacePoints: 3, secondPlacePoints: 1, drawPoints: 1 },
      { name: 'EuroLeague', password: '123456', maxTeams: 18, competition: 'Basketball', description: 'Top European basketball league', adminId: daisy.id, firstPlacePoints: 2, secondPlacePoints: 1, drawPoints: 0 }
    ], { returning: true });

    const [premierLeague, nba, laLiga, serieA, mls, euroLeague] = leagues;

    // Create Teams
    const teams = await Team.bulkCreate([
      { name: 'Manchester United', password: '123456', maxPlayers: 25, leagueId: premierLeague.id, adminId: john.id },
      { name: 'Liverpool', password: '123456', maxPlayers: 25, leagueId: premierLeague.id, adminId: jane.id },
      { name: 'Los Angeles Lakers', password: '123456', maxPlayers: 15, leagueId: nba.id, adminId: john.id },
      { name: 'Golden State Warriors', password: '123456', maxPlayers: 15, leagueId: nba.id, adminId: jane.id },
      { name: 'Real Madrid', password: '123456', maxPlayers: 25, leagueId: laLiga.id, adminId: alice.id },
      { name: 'Barcelona', password: '123456', maxPlayers: 25, leagueId: laLiga.id, adminId: bob.id },
      { name: 'Juventus', password: '123456', maxPlayers: 25, leagueId: serieA.id, adminId: john.id },
      { name: 'AC Milan', password: '123456', maxPlayers: 25, leagueId: serieA.id, adminId: jane.id },
      { name: 'Seattle Sounders', password: '123456', maxPlayers: 25, leagueId: mls.id, adminId: charlie.id },
      { name: 'Toronto FC', password: '123456', maxPlayers: 25, leagueId: mls.id, adminId: daisy.id },
      { name: 'CSKA Moscow', password: '123456', maxPlayers: 15, leagueId: euroLeague.id, adminId: charlie.id },
      { name: 'Real Madrid Basket', password: '123456', maxPlayers: 15, leagueId: euroLeague.id, adminId: daisy.id }
    ], { returning: true });

    const [manu, liverpool, lakers, warriors, madrid, barca, juventus, milan, seattle, toronto, cska, madridBasket] = teams;

    // Create Matches
    await Match.bulkCreate([
      { leagueId: premierLeague.id, eventType: 'League', eventLocation: 'Old Trafford', team1: manu.id, team2: liverpool.id, team1Score: 2, team2Score: 1 },
      { leagueId: premierLeague.id, eventType: 'League', eventLocation: 'Anfield', team1: liverpool.id, team2: manu.id, team1Score: 1, team2Score: 1 },
      { leagueId: nba.id, eventType: 'League', eventLocation: 'Staples Center', team1: lakers.id, team2: warriors.id, team1Score: 105, team2Score: 99 },
      { leagueId: laLiga.id, eventType: 'League', eventLocation: 'Santiago Bernabéu', team1: madrid.id, team2: barca.id, team1Score: 3, team2Score: 2 },
      { leagueId: serieA.id, eventType: 'League', eventLocation: 'Allianz Stadium', team1: juventus.id, team2: milan.id, team1Score: 1, team2Score: 0 },
      { leagueId: mls.id, eventType: 'League', eventLocation: 'Lumen Field', team1: seattle.id, team2: toronto.id, team1Score: 2, team2Score: 1 },
      { leagueId: euroLeague.id, eventType: 'League', eventLocation: 'Palacio de Deportes', team1: cska.id, team2: madridBasket.id, team1Score: 89, team2Score: 85 },
      { leagueId: nba.id, eventType: 'League', eventLocation: 'Chase Center', team1: warriors.id, team2: lakers.id, team1Score: 110, team2Score: 108 },
      { leagueId: laLiga.id, eventType: 'League', eventLocation: 'Camp Nou', team1: barca.id, team2: madrid.id, team1Score: 1, team2Score: 1 },
      { leagueId: serieA.id, eventType: 'League', eventLocation: 'San Siro', team1: milan.id, team2: juventus.id, team1Score: 2, team2Score: 2 }
    ]);

    console.log('Seed data successfully inserted');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

seedData();
