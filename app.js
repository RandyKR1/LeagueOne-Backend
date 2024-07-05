const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
// const { authenticateToken } = require('./utilities/auth'); // Import authenticate middleware from utilities/auth.js

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication middleware
// app.use(authenticateToken);

// Routes
const userRoutes = require('./routes/user');
const teamRoutes = require('./routes/team');
const leagueRoutes = require('./routes/league');
const matchRoutes = require('./routes/match');
const authRoutes = require('./routes/auth'); // Import authRoutes

app.use('/users', userRoutes);
app.use('/teams', teamRoutes);
app.use('/leagues', leagueRoutes);
app.use('/leagues/:leagueId/matches', matchRoutes);
app.use('/auth', authRoutes); // Mount auth routes under /auth endpoint

module.exports = app;


