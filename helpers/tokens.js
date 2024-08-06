require('dotenv').config();  // Load environment variables from .env file

const jwt = require("jsonwebtoken");  // Import the jsonwebtoken library for creating and verifying JWTs

/**
 * Function to create a JSON Web Token (JWT) for a user.
 * The token contains user details and is signed using a secret key.
 * 
 * @param {Object} user - The user object containing user details
 * @param {number} user.id - The user's ID
 * @param {string} user.username - The user's username
 * @param {boolean} user.isLeagueAdmin - Flag indicating if the user is a league admin
 * @param {boolean} user.isTeamAdmin - Flag indicating if the user is a team admin
 * 
 * @returns {string} - The signed JWT
 */
function createToken(user) {
  // Create the payload for the JWT with user details
  let payload = {
    id: user.id,
    username: user.username,
    isAdmin: user.isAdmin,
    isLeagueAdmin: user.isLeagueAdmin,
    isTeamAdmin: user.isTeamAdmin,
  };

  // Log the payload for debugging purposes
  console.log(payload);

  // Use process.env.JWT_SECRET to access the JWT_SECRET variable from .env
  return jwt.sign(payload, process.env.JWT_SECRET);
}

module.exports = { createToken };  // Export the createToken function for use in other parts of the application
