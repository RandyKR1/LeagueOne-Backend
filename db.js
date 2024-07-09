require('dotenv').config(); // Load environment variables from .env file
const { Sequelize } = require('sequelize');
const { getDatabaseUri } = require('./config/db'); // Adjust the path as per your file structure

const sequelize = new Sequelize(getDatabaseUri(), {
  dialect: 'postgres',
  logging: true
});

module.exports = sequelize;
