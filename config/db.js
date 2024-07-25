require('dotenv').config(); 
const { Client } = require('pg')
const { getDatabaseUri } = require('./config/config');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(getDatabaseUri(), {
  dialect: 'postgres',
  logging: true
});

module.exports = {
  sequelize
};
