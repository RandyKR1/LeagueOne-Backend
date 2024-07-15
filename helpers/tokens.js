require('dotenv').config();
const jwt = require("jsonwebtoken");

function createToken(user) {
  let payload = {
    id: user.id,
    username: user.username,
    isAdmin: user.isAdmin,
    isLeagueAdmin: user.isLeagueAdmin,
    isTeamAdmin: user.isTeamAdmin,
  };
  console.log(payload)

  // Use process.env.JWT_SECRET to access the JWT_SECRET variable from .env
  return jwt.sign(payload, process.env.JWT_SECRET);
}

module.exports = { createToken };
