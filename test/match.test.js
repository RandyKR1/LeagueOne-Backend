const { sequelize, Match, League, User, Team } = require('../models');
const bcrypt = require('bcrypt');

beforeAll(async () => {
  // Sync the database, ensuring all tables are created
  await sequelize.sync({ force: true });

  // Create a user to associate with the league
  await User.create({
    id: 1,
    username: 'AdminUser',
    firstName: 'Admin', 
    lastName: 'User',
    email: 'admin@example.com',
    password: bcrypt.hashSync('password', 10),
  });

  // Create a league
  await League.create({
    id: 1,
    name: 'Test League',
    password: 'leaguepass',
    maxTeams: 10,
    competition: 'Soccer',
    description: 'This is a test league',
    adminId: 1,
    firstPlacePoints: 10,
    secondPlacePoints: 5,
    drawPoints: 1,
  });

  // Create teams
  await Team.create({ id: 1, name: 'Team 1', leagueId: 1 });
  await Team.create({ id: 2, name: 'Team 2', leagueId: 1 });
});

afterAll(async () => {
  // Close the database connection after tests
  await sequelize.close();
});

describe('Match Model', () => {
  test('should create a new match', async () => {
    const match = await Match.create({
      leagueId: 1,
      eventType: 'League',
      eventLocation: 'Stadium',
      team1: 1,
      team2: 2,
      team1Score: 2,
      team2Score: 3,
    });

    expect(match).toBeDefined();
    expect(match.leagueId).toBe(1);
    expect(match.eventType).toBe('League');
    expect(match.eventLocation).toBe('Stadium');
    expect(match.team1).toBe(1);
    expect(match.team2).toBe(2);
    expect(match.team1Score).toBe(2);
    expect(match.team2Score).toBe(3);
  });

  test('should associate match with league and teams', async () => {
    const match = await Match.findOne({ where: { leagueId: 1 } });
    const league = await match.getLeague();
    const homeTeam = await match.getHomeTeam();
    const awayTeam = await match.getAwayTeam();

    expect(league).toBeDefined();
    expect(league.name).toBe('Test League');
    expect(homeTeam).toBeDefined();
    expect(homeTeam.name).toBe('Team 1');
    expect(awayTeam).toBeDefined();
    expect(awayTeam.name).toBe('Team 2');
  });
});
