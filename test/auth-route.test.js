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

  test('POST /auth/register should return 400 for duplicate username', async () => {
    // // Create a user
    // console.log('Creating first user with username: existinguser');
    // const firstResponse = await request(app)
    //   .post('/auth/register')
    //   .send({
    //     username: 'existinguser',
    //     password: 'testpassword',
    //     firstName: 'John',
    //     lastName: 'Doe',
    //     email: 'john.doe@example.com',
    //   });

    // console.log('First response status:', firstResponse.status);
    // console.log('First response body:', firstResponse.body);

    console.log('Attempting to create the same user again');
    const secondResponse = await request(app)
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

    console.log('Second response status:', secondResponse.status);
    console.log('Second response body:', secondResponse.body);

    expect(secondResponse.status).toBe(400);

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
