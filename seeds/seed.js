const bcrypt = require('bcrypt');
const { User, League, Team, Match, TeamLeagues, LeagueMembers, MatchTeams } = require('../models'); // Adjust the import path as per your project structure

async function seedDatabase() {
  await seedUsers();
  await seedLeagues();
  await seedTeams();
  await seedMatches();
  await seedAssociations();
}

async function seedUsers() {
  const userData = [];

  // Generate 45 users
  for (let i = 1; i <= 45; i++) {
    userData.push({
      firstName: `User${i}`,
      lastName: `LastName${i}`,
      email: `user${i}@example.com`,
      username: `user${i}`,
      password: bcrypt.hashSync(`password${i}`, 10),
      isLeagueAdmin: i === 1, // Make the first user a league admin for demonstration
      isTeamAdmin: false,
    });
  }

  await User.bulkCreate(userData);
}

async function seedLeagues() {
  const leagueData = [
    {
      name: 'League A',
      adminId: 1, // Replace with the admin user ID for League A
      maxTeams: 10,
      description: 'This is League A for demonstration',
    },
    {
      name: 'League B',
      adminId: 2, // Replace with the admin user ID for League B
      maxTeams: 12,
      description: 'This is League B for demonstration',
    },
    {
      name: 'League C',
      adminId: 3, // Replace with the admin user ID for League C
      maxTeams: 8,
      description: 'This is League C for demonstration',
    },
  ];

  await League.bulkCreate(leagueData);
}

async function seedTeams() {
  const teamsData = [];

  // Generate 15 teams associated with leagues
  for (let i = 1; i <= 15; i++) {
    const leagueId = i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1; // Distribute teams across leagues A, B, C
    teamsData.push({
      name: `Team ${i}`,
      adminId: i, // Replace with the admin user ID for the team
      maxPlayers: 15,
      leagueId: leagueId,
    });
  }

  await Team.bulkCreate(teamsData);
}

async function seedMatches() {
  const matchesData = [];

  // Generate 50 matches associated with leagues and teams
  for (let i = 1; i <= 50; i++) {
    const leagueId = i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1; // Distribute matches across leagues A, B, C
    const teamIds = [i % 15 + 1, (i + 1) % 15 + 1]; // Example: Each match involves two teams

    matchesData.push({
      leagueId: leagueId,
      eventType: i % 3 === 0 ? 'Tournament' : 'Friendly', // Example: Alternating event types
      eventLocation: `Location ${i}`,
      eventCompetition: 'Soccer', // Example: Soccer competition
      eventParticipants: `Team ${teamIds[0]} vs Team ${teamIds[1]}`,
      eventResults: `${Math.floor(Math.random() * 5)}-${Math.floor(Math.random() * 5)}`, // Random results
    });
  }

  await Match.bulkCreate(matchesData);
}

async function seedAssociations() {
  // Clear previous associations
  await TeamLeagues.destroy({
    truncate: {
      cascade: true
    }
  });
  await LeagueMembers.destroy({
    truncate: {
      cascade: true
    }
  });
  await MatchTeams.destroy({
    truncate: {
      cascade: true
    }
  });

  // Example associations (randomly assign users to teams and leagues)
  const teamLeaguesData = [];
  const leagueMembersData = [];
  const matchTeamsData = [];

  // Assign users to leagues and teams
  const users = await User.findAll();
  const teams = await Team.findAll();

  teams.forEach((team, index) => {
    const user = users[index];
    if (user) {
      teamLeaguesData.push({
        teamId: team.id,
        leagueId: team.leagueId
      });
      leagueMembersData.push({
        userId: user.id,
        leagueId: team.leagueId
      });
    }
  });

  // Assign teams to matches
  const matches = await Match.findAll();

  matches.forEach((match, index) => {
    const teamIds = [index % 15 + 1, (index + 1) % 15 + 1]; // Example: Each match involves two teams
    matchTeamsData.push({
      matchId: match.id,
      teamId: teamIds[0]
    });
    matchTeamsData.push({
      matchId: match.id,
      teamId: teamIds[1]
    });
  });

  await TeamLeagues.bulkCreate(teamLeaguesData);
  await LeagueMembers.bulkCreate(leagueMembersData);
  await MatchTeams.bulkCreate(matchTeamsData);
}

// Execute the seed function
seedDatabase()
  .then(() => {
    console.log('Database seeding completed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error seeding database:', err);
    process.exit(1);
  });

module.exports = seedDatabase; // Export for testing purposes or other scripts
