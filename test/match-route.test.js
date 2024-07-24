const request = require('supertest');
const express = require('express');
const { sequelize, User, League, Team, Match } = require('../models');
const authRoutes = require('../routes/auth'); // Adjust the path if needed
const leagueRoutes = require('../routes/league'); // Adjust the path if needed
const matchRoutes = require('../routes/match'); // Adjust the path if needed
// const { createToken } = require('../helpers/tokens'); // Utility to create tokens
// const { isTeamAdmin } = require('../middleware/auth');

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use('/auth', authRoutes);
app.use('/leagues', leagueRoutes);
app.use('/leagues/:leagueId/matches', matchRoutes);

beforeAll(async () => {
  // Sync the database
  await sequelize.sync({ force: true });

  // Create initial data
  await User.create({
    username: 'admin',
    password: 'password', // Ensure this matches your hashing mechanism
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    isLeagueAdmin: true,
    isTeamAdmin: true
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
    id: 1, 
    name: 'Team A',
    maxPlayers: 15 
});
  await Team.create({ 
    id: 2, 
    name: 'Team B', 
    maxPlayers: 15  
});

  await Match.create({
    leagueId: 1,
    eventType: 'Friendly',
    eventLocation: 'Stadium A',
    team1: 1,
    team2: 2,
    team1Score: 2,
    team2Score: 1
  });
});

afterAll(async () => {
  // Close the database connection
  await sequelize.close();
});

describe('Match Routes', () => {
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

  test('GET /leagues/:leagueId/matches should return all matches for a league', async () => {
    const response = await request(app)
      .get('/leagues/1/matches')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body[0]).toHaveProperty('eventType', 'Friendly');
  });

  test('GET /leagues/:leagueId/matches/:matchId should return a specific match', async () => {
    const response = await request(app)
      .get('/leagues/1/matches/1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('eventLocation', 'Stadium A');
  });

  test('DELETE /leagues/:leagueId/matches/:matchId should delete a match', async () => {
    const response = await request(app)
      .delete('/leagues/1/matches/1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(204);
  });
});
