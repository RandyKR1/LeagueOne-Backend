const { sequelize, Team, User, League, Match, Standing } = require('../models');
const bcrypt = require('bcrypt');

beforeAll(async () => {
  // Sync the database, ensuring all tables are created
  await sequelize.sync({ force: true });

  // Create a user to associate with the team
  await User.create({
    id: 1,
    username: 'AdminUser',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: bcrypt.hashSync('password', 10),
  });

  // Create a league to associate with the team
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
});

afterAll(async () => {
  // Close the database connection after tests
  await sequelize.close();
});

describe('Team Model', () => {
  test('should create a new team', async () => {
    const team = await Team.create({
      name: 'Test Team',
      password: 'teampass',
      maxPlayers: 25,
      adminId: 1,
    });

    expect(team).toBeDefined();
    expect(team.name).toBe('Test Team');
  });

  test('should hash password before saving', async () => {
    const team = await Team.create({
      name: 'Hash Test Team',
      password: 'plainpassword',
      maxPlayers: 20,
      adminId: 1,
    });

    expect(team.password).not.toBe('plainpassword');
    expect(bcrypt.compareSync('plainpassword', team.password)).toBe(true);
  });

  test('should find all teams with filters', async () => {
    const team1 = await Team.create({
      name: 'Filter Team 1',
      maxPlayers: 20,
      adminId: 1,
    });

    const team2 = await Team.create({
      name: 'Filter Team 2',
      maxPlayers: 15,
      adminId: 1,
    });

    const teams = await Team.findAllWithFilters({ name: 'Filter Team 1' });

    expect(teams.length).toBe(1);
    expect(teams[0].name).toBe('Filter Team 1');
  });
});
