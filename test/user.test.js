const { sequelize, User, Team } = require('../models');
const bcrypt = require('bcrypt');
const { UnauthorizedError } = require('../expressError');

beforeAll(async () => {
  // Sync the database, ensuring all tables are created
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Close the database connection after tests
  await sequelize.close();
});

describe('User Model', () => {
  test('should create a new user', async () => {
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      username: 'johndoe',
      password: 'securepassword',
    });

    expect(user).toBeDefined();
    expect(user.username).toBe('johndoe');
  });

  test('should hash password before saving', async () => {
    const user = await User.create({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      username: 'janedoe',
      password: 'plaintextpassword',
    });

    expect(user.password).not.toBe('plaintextpassword');
    expect(bcrypt.compareSync('plaintextpassword', user.password)).toBe(true);
  });

  test('should authenticate user with valid credentials', async () => {
    await User.create({
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice.smith@example.com',
      username: 'alicesmith',
      password: 'password123',
    });

    const user = await User.authenticate('alicesmith', 'password123');
    
    expect(user).toHaveProperty('id');
    expect(user.username).toBe('alicesmith');
  });

  test('should throw error with invalid credentials', async () => {
    try {
      await User.authenticate('nonexistentuser', 'wrongpassword');
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedError);
      expect(error.message).toBe('Invalid username/password');
    }
  });

  test('should find all users with filters', async () => {
    await User.create({
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie.brown@example.com',
      username: 'charliebrown',
      password: 'password456',
    });

    await User.create({
      firstName: 'Daisy',
      lastName: 'Johnson',
      email: 'daisy.johnson@example.com',
      username: 'daisyjohnson',
      password: 'password789',
    });

    const users = await User.findAllWithFilters({ firstName: 'Charlie' });

    expect(users.length).toBeGreaterThan(0);
    expect(users[0].username).toBe('charliebrown');
  });
});
