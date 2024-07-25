const express = require('express');
const app = express();
const cors = require('cors');
const { NotFoundError, BadRequestError, UnauthorizedError } = require("./expressError");
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

        
/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
    return next(new NotFoundError());
  });


  /** Custom error handlers for specific errors */
app.use((err, req, res, next) => {
  if (err instanceof BadRequestError) {
    return res.status(400).json({ error: { message: err.message, status: err.status } });
  }
  if (err instanceof UnauthorizedError) {
    return res.status(401).json({ error: { message: err.message, status: err.status } });
  }
  // Add handlers for other specific errors if needed
  next(err); // Forward to generic error handler
});

  
  /** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
    if (process.env.NODE_ENV !== "test") console.error(err.stack);
    const status = err.status || 500;
    const message = "Generic Error Handler in App.js";
  
    return res.status(status).json({
      error: { message, status },
    });
  });

module.exports = app;


