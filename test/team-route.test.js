const request = require('supertest');
const express = require('express');
const { sequelize, User, Team, League, Match } = require('../models');
const authRoutes = require('../routes/auth'); // Adjust the path if needed
const teamRoutes = require('../routes/team'); // Adjust the path if needed

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use('/auth', authRoutes);
app.use('/teams', teamRoutes);

beforeAll(async () => {
  // Sync the database
  await sequelize.sync({ force: true });

  await User.create({
    username: 'admin',
    password: 'password',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com'
  });

  // Create initial data
    const league = await League.create({ 
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

  const team = await Team.create({
    name: 'Test Team',
    password: 'testpassword',
    maxPlayers: 5,
    adminId: 1
  });

  await team.addLeagues([league.id]);

  // Create a match associated with the league
  await Match.create({
    leagueId: league.id,
    eventType: 'Friendly',
    eventLocation: 'Stadium A',
    team1: team.id,
    team2: team.id,
    team1Score: 0,
    team2Score: 0
  });
});

afterAll(async () => {
  // Close the database connection
  await sequelize.close();
});

describe('Team Routes', () => {
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

  test('GET /teams should return all teams', async () => {
    const response = await request(app)
      .get('/teams')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body[0]).toHaveProperty('name', 'Test Team');
  });

  test('GET /teams/:id should return a team by ID', async () => {
    const teamId = 1; // Assuming ID of the test team is 1
    const response = await request(app)
      .get(`/teams/${teamId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('name', 'Test Team');
  });

  test('POST /teams/create should create a new team', async () => {
    const response = await request(app)
      .post('/teams/create')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'New Test Team',
        password: 'newtestpassword',
        maxPlayers: 5
      });

    expect(response.status).toBe(201);
    expect(response.body.team).toHaveProperty('name', 'New Test Team');
  });

  test('POST /teams/:id/join should allow a user to join a team', async () => {
    const teamId = 1; // Assuming ID of the test team is 1
    const response = await request(app)
      .post(`/teams/${teamId}/join`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        password: 'testpassword'
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Joined the team successfully');
  });

  test('POST /teams/:id/leave should allow a user to leave a team', async () => {
    const teamId = 1; // Assuming ID of the test team is 1
    const response = await request(app)
      .post(`/teams/${teamId}/leave`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Left the team successfully');
  });

});
