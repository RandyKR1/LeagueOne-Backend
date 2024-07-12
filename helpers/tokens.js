require('dotenv').config();
const jwt = require("jsonwebtoken");

function createToken(user) {
  console.assert(user.isAdmin !== undefined,
      "createToken passed user without isAdmin property");

  let payload = {
    username: user.username,
    isAdmin: user.isAdmin || false,
  };

  // Use process.env.JWT_SECRET to access the JWT_SECRET variable from .env
  return jwt.sign(payload, process.env.JWT_SECRET);
}

module.exports = { createToken };
