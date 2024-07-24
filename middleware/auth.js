const jwt = require('jsonwebtoken');
const { User, League, Team } = require('../models');
const { JWT_SECRET } = process.env; // Changed SECRET_KEY to JWT_SECRET

/**
 * Middleware to authenticate JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7); // Extract the token from the Authorization header
      const decoded = jwt.verify(token, JWT_SECRET); // Verify the token with your secret key
      req.user = decoded; // Set the decoded user information to req.user
      console.log("User:", req.user);
    } else {
      // User is not authenticated
      req.user = null;
    }
    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    next(err); // Pass error to error handling middleware
  }
}

/**
 * Middleware to ensure the user is logged in
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    console.log('Unauthorized: User not authenticated');
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }
  next();
}

/**
 * Middleware to ensure the user is a league admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function isLeagueAdmin(req, res, next) {
  const { user, params } = req;
  const leagueId = params.leagueId || params.id;
  try {
    const league = await League.findByPk(leagueId);
    if (league && league.adminId === user.id) {
      return next();
    } else {
      return res.status(403).json({ error: 'Forbidden: You must be a league admin' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Middleware to ensure the user is a team admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function isTeamAdmin(req, res, next) {
  const { user, params } = req;
  const teamId = params.teamId || params.id;
  if (!user || !teamId) {
    return res.status(400).json({ error: 'Bad Request: Missing user or team ID' });
  }
  try {
    const team = await Team.findByPk(teamId);
    if (team && team.adminId === user.id) {
      return next();
    } else {
      return res.status(403).json({ error: 'Forbidden: You must be a team admin' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Middleware to ensure the user is a team admin based on the teamId in the request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function isTeamAdminForLeagueJoin(req, res, next) {
  const { user, body } = req;
  const teamId = body.teamId;

  if (!teamId) {
    console.error('Team ID is missing from request body');
    return res.status(400).json({ error: 'Team ID is required' });
  }

  try {
    const team = await Team.findByPk(teamId);
    if (team && team.adminId === user.id) {
      console.log(`User ${user.id} is admin of team ${teamId}`);
      return next();
    } else {
      console.error(`User ${user.id} is not an admin of team ${teamId}`);
      return res.status(403).json({ error: 'Forbidden: You must be a team admin' });
    }
  } catch (error) {
    console.error('Error checking team admin:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  isLeagueAdmin,
  isTeamAdmin,
  isTeamAdminForLeagueJoin
};
