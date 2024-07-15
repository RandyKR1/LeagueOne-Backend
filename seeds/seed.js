const { sequelize } = require('../models'); // Adjust the path to your models file
const { User, League, Team, Match } = require('../models');

async function seed() {
  await sequelize.sync({ force: true }); // This will drop the existing tables and recreate them

  // Create Users
  const users = await User.bulkCreate([
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      username: 'johndoe',
      password: 'password1', // Ensure passwords are hashed if using real data
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      username: 'janesmith',
      password: 'password2',
    },
    // Add more users as needed
  ]);

  // Create Leagues
  const leagues = await League.bulkCreate([
    {
      name: 'Premier League',
      password: 'leaguepass1', // Ensure passwords are hashed if using real data
      maxTeams: 20,
      description: 'Top tier league',
      adminId: 1
    },
    {
      name: 'Championship',
      password: 'leaguepass2',
      maxTeams: 24,
      description: 'Second tier league',
      adminId: 2
    },
    // Add more leagues as needed
  ]);

  // Create Teams
  const teams = await Team.bulkCreate([
    {
      name: 'Team A',
      password: 'teampass1',
      maxPlayers: 15,
      leagueId: leagues[0].id,
      adminId: users[0].id,
    },
    {
      name: 'Team B',
      password: 'teampass2',
      maxPlayers: 15,
      leagueId: leagues[0].id,
      adminId: users[1].id,
    },
    // Add more teams as needed
  ]);

  // Create Matches
  const matches = await Match.bulkCreate([
    {
      leagueId: leagues[0].id,
      eventName: 'Match 1',
      eventLocation: 'Location 1',
      eventParticipants: JSON.stringify(['Team A', 'Team B']), // Adjust as necessary
      eventType: 'Type 1',
      eventResults: JSON.stringify({ winner: 'Team A' }), // Adjust as necessary
      creatorId: users[0].id,
    },
    {
      leagueId: leagues[0].id,
      eventName: 'Match 2',
      eventLocation: 'Location 2',
      eventParticipants: JSON.stringify(['Team A', 'Team C']), // Adjust as necessary
      eventType: 'Type 2',
      eventResults: JSON.stringify({ winner: 'Team C' }), // Adjust as necessary
      creatorId: users[1].id,
    },
    // Add more matches as needed
  ]);

  console.log('Database seeded successfully');
}

seed()
  .then(() => {
    console.log('Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  });
