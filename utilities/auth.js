const jwt = require('jsonwebtoken');
const { User } = require('../models');
const bcrypt = require('bcrypt');

const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
};


const authenticateToken = (req, res, next) => {
  // Check if the route requires authentication (e.g., if it has a specific flag or is a certain path)
  if (req.requireAuth) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
      return res.status(401).json({ error: 'Authentication token not provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }
      try {
        const loggedInUser = await User.findByPk(user.id);
        if (!loggedInUser) {
          return res.status(404).json({ error: 'User not found' });
        }
        req.user = loggedInUser;
        next();
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  } else {
    // If authentication is not required, proceed to the next middleware or route handler
    next();
  }
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Find user by username
      const user = await User.findOne({ where: { username } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Validate password
      const isPasswordValid = bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Incorrect Password', passwordMatched: false, inputPassword: password, storedPassword: user.password });
      }
  
      // Generate JWT token
      const token = generateToken(user);
  
      res.json({ token });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

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


const isTeamAdmin = async (req, res, next) => {
    const teamId = req.params.teamId || req.body.teamId;
    const userId = req.user.id;

    try {
        const team = await Team.findByPk(teamId);
        if (team && team.adminId === userId) {
            return next();
        } else {
            return res.status(403).json({ error: 'User is not the team admin' });
        }
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};


module.exports = {
  generateToken,
  authenticateToken,
  loginUser,
  isTeamAdmin,
  // isLeagueAdmin
};
