const { sequelize, League, User, Team, Match, Standing } = require('../models');
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
});

afterAll(async () => {
  // Close the database connection after tests
  await sequelize.close();
});

describe('League Model', () => {
  test('should create a new league', async () => {
    const league = await League.create({
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

    expect(league).toBeDefined();
    expect(league.name).toBe('Test League');
  });

  test('should hash password before saving', async () => {
    const league = await League.create({
      name: 'Hash Test League',
      password: 'plainpassword',
      maxTeams: 10,
      competition: 'Soccer',
      description: 'This is a test league for password hashing',
      adminId: 1,
      firstPlacePoints: 10,
      secondPlacePoints: 5,
      drawPoints: 1,
    });

    expect(league.password).not.toBe('plainpassword');
    expect(bcrypt.compareSync('plainpassword', league.password)).toBe(true);
  });

  test('should find all leagues with filters', async () => {
    const league1 = await League.create({
      name: 'Filter League 1',
      maxTeams: 10,
      competition: 'Soccer',
      adminId: 1,
      firstPlacePoints: 10,
    });

    const league2 = await League.create({
      name: 'Filter League 2',
      maxTeams: 5,
      competition: 'Soccer',
      adminId: 1,
      firstPlacePoints: 10,
    });

    const leagues = await League.findAllWithFilters({ name: 'Filter League 1', maxTeams: 10 });

    expect(leagues.length).toBe(1);
    expect(leagues[0].name).toBe('Filter League 1');
  });
});
