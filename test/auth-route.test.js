const request = require('supertest');
const express = require('express');
const { sequelize } = require('../models');
const authRoutes = require('../routes/auth');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Auth Routes', () => {
  test('POST /auth/register should create a new user', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({
        username: 'testuser',
        password: 'testpassword',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        isLeagueAdmin: false, 
        isTeamAdmin: false,
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      isLeagueAdmin: false,
      isTeamAdmin: false,
    });
  });


  test('POST /auth/token should return a token for valid credentials', async () => {
    await request(app)
      .post('/auth/register')
      .send({
        username: 'testuser',
        password: 'testpassword',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      });

    const response = await request(app)
      .post('/auth/token')
      .send({
        username: 'testuser',
        password: 'testpassword',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  test('POST /auth/token should return 401 for invalid credentials', async () => {
    const response = await request(app)
      .post('/auth/token')
      .send({
        username: 'invaliduser',
        password: 'invalidpassword',
      });

    expect(response.status).toBe(401);
  });
});
