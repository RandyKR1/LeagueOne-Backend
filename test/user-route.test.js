const request = require('supertest');
const express = require('express');
const { sequelize, User, Team, League } = require('../models');
const authRoutes = require('../routes/auth'); // Adjust the path if needed
const userRoutes = require('../routes/user'); // Adjust the path if needed

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

beforeAll(async () => {
  // Sync the database
  await sequelize.sync({ force: true });

  // Create initial data
  await User.create({
    username: 'admin',
    password: 'password',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com'
  });

  await League.create({
    id: 1,
    name: 'Test League',
    password: 'testpassword',
    maxTeams: 10,
    competition: 'Soccer',
    description: 'A test league',
    adminId: 1,
    firstPlacePoints: 3,
    secondPlacePoints: 2,
    drawPoints: 1
  });

  await Team.create({
    name: 'Test Team',
    password: 'testpassword',
    maxPlayers: 5,
    adminId: 1
  });

  await Team.findByPk(1).then(team => team.addLeagues([1]));
});

afterAll(async () => {
  // Close the database connection
  await sequelize.close();
});

describe('User Routes', () => {
  let adminToken;

  beforeAll(async () => {
    // Authenticate as admin and get token
    const response = await request(app)
      .post('/auth/token')
      .send({
        username: 'admin',
        password: 'password'
      });
    adminToken = response.body.token;
  });

  test('GET /users should return all users with optional filters', async () => {
    const response = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({}); // Pass empty query for no filters

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body[0]).toHaveProperty('username', 'admin');
  });

  test('GET /users/:username should return a user by username', async () => {
    const response = await request(app)
      .get('/users/admin')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('username', 'admin');
    expect(response.body.uniqueLeagues).toBeInstanceOf(Array);
  });

  test('GET /users/:username should return 404 for non-existent user', async () => {
    const response = await request(app)
      .get('/users/nonexistent')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'User not found');
  });


  test('DELETE /users/:username should return 404 for non-existent user', async () => {
    const response = await request(app)
      .delete('/users/nonexistent')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'User not found');
  });
});
