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
    }
    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    next(err); // Handle errors or continue to next middleware
  }
}

/**
 * Middleware to ensure the user is logged in
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function ensureLoggedIn(req, res, next) {
  try {
    // Extract the token from the Authorization header
    const token = req.headers.authorization.split(" ")[1]; // Bearer <token>
    
    // Verify the token and set the payload as req.user
    const payload = jwt.verify(token, JWT_SECRET); // Changed SECRET_KEY to JWT_SECRET
    req.user = payload;
    return next();
  } catch (err) {
    console.log('Unauthorized: You must be logged in');
    return res.status(401).json({ error: 'Unauthorized: You must be logged in' });
  }
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
 * Middleware to ensure the user is a league member
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function isLeagueMember(req, res, next) {
  const { user, params } = req;
  const leagueId = params.leagueId || params.id;
  try {
    const league = await League.findByPk(leagueId, {
      include: [{ model: User, as: 'members', where: { id: user.id } }]
    });
    if (league) {
      return next();
    } else {
      return res.status(403).json({ error: 'Forbidden: You must be a league member' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  isLeagueAdmin,
  isTeamAdmin,
  isLeagueMember
};
