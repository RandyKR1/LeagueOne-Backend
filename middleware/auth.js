"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { UnauthorizedError, BadRequestError } = require("../expressError");
const jsonschema = require("jsonschema");
const { User } = require('../models');
const bcrypt = require('bcrypt');
const { JWT_SECRET } = process.env; 


function generateToken(user) {
    console.assert(user.id !== undefined && user.username !== undefined, "createToken passed user without required properties");
  
    let payload = {
      id: user.id,
      username: user.username,
    };
  
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  }


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, JWT_SECRET);
    }
    return next();
  } catch (err) {
    return next();
  }
}

  // const isLeagueAdmin = async (req, res, next) => {
//     const leagueId = req.params.id || req.body.leagueId;
//     const userId = req.user.id;
  
//     try {
//       const league = await League.findByPk(leagueId);
//       if (league && league.adminId === userId) {
//         return next();
//       } else {
//         return res.status(403).json({ error: 'User is not the league admin' });
//       }
//     } catch (error) {
//       return res.status(400).json({ error: error.message });
//     }
//   };

// const isLeagueMember = async (req, res, next) => {
//     const leagueId = req.params.leagueId || req.body.leagueId;
//     const userId = req.user.id;

//     try {
//         const league = await League.findByPk(leagueId, {
//             include: {
//                 model: User,
//                 as: 'members',
//                 through: { where: { userId } },
//             },
//         });

//         if (league && league.members.length > 0) {
//             return next();
//         } else {
//             return res.status(403).json({ error: 'User is not a member of the league' });
//         }
//     } catch (error) {
//         return res.status(400).json({ error: error.message });
//     }
// };


// const isTeamAdmin = async (req, res, next) => {
//     const teamId = req.params.teamId || req.body.teamId;
//     const userId = req.user.id;

//     try {
//         const team = await Team.findByPk(teamId);
//         if (team && team.adminId === userId) {
//             return next();
//         } else {
//             return res.status(403).json({ error: 'User is not the team admin' });
//         }
//     } catch (error) {
//         return res.status(400).json({ error: error.message });
//     }
// };

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

function schemaValidation(data, schema){
  const validator = jsonschema.validate(data, schema);
  if(!validator.valid){
    const errs = validator.errors.map(e => e.stack)
    throw new BadRequestError(errs)
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  schemaValidation,
  generateToken,
};
