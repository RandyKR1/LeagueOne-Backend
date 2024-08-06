require('dotenv').config();  // Load environment variables from .env file

const { Client } = require('pg');  // Import the pg client for PostgreSQL
const { getDatabaseUri } = require('./config');  // Import the getDatabaseUri function from the config module
const { Sequelize } = require('sequelize');  // Import Sequelize for ORM

// Initialize a new Sequelize instance with the database URI and options
const sequelize = new Sequelize(getDatabaseUri(), {
  dialect: 'postgres',  // Specify the dialect for the database
  logging: true  // Enable logging for Sequelize
});

// Log the database URI for debugging purposes
console.log("Database URI:", getDatabaseUri());

module.exports = {
  sequelize  // Export the sequelize instance for use in other parts of the application
};
