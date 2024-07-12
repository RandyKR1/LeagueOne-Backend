const jwt = require('jsonwebtoken');
const { User, League, Team } = require('../models');

/**
 * Middleware to authenticate JWT tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function authenticateJWT(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = decoded;
    next();
  });
}

/**
 * Middleware to ensure the user is logged in
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: You must be logged in' });
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
