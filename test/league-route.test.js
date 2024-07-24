const request = require('supertest');
const express = require('express');
const { sequelize, User, League, Team, Match, Standing, TeamLeagues } = require('../models');
const authRoutes = require('../routes/auth'); // Adjust the path if needed
const leagueRoutes = require('../routes/league'); // Adjust the path if needed

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies
app.use('/auth', authRoutes);
app.use('/leagues', leagueRoutes);

beforeAll(async () => {
  // Sync the database
  await sequelize.sync({ force: true });

  // Create some initial data if necessary
  // Example user
  await User.create({
    username: 'admin',
    password: 'password',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    isLeagueAdmin: true
  });

  // Example league
  await League.create({
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

  // Example team
  await Team.create({
    name: 'Test Team'
  });

  // Example standing
  await Standing.create({
    leagueId: 1,
    teamId: 1,
    points: 0,
    wins: 0,
    losses: 0,
    draws: 0
  });
});

afterAll(async () => {
  // Close the database connection
  await sequelize.close();
});


describe('League Routes', () => {
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
  
    test('GET /leagues should return all leagues', async () => {
      const response = await request(app)
        .get('/leagues')
        .set('Authorization', `Bearer ${adminToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
    });
  
    test('GET /leagues/:id should return a specific league', async () => {
      const response = await request(app)
        .get('/leagues/1')
        .set('Authorization', `Bearer ${adminToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Test League');
    });
  
    test('GET /leagues/:id/standings should return standings for a specific league', async () => {
      const response = await request(app)
        .get('/leagues/1/standings')
        .set('Authorization', `Bearer ${adminToken}`);
  
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body[0]).toHaveProperty('points', 0);
    });
  
  
    test('DELETE /leagues/:id should delete a league', async () => {
      const response = await request(app)
        .delete('/leagues/1')
        .set('Authorization', `Bearer ${adminToken}`);
  
      expect(response.status).toBe(204);
    });
  });
  