require('dotenv').config(); 
const { Client } = require('pg')
const { getDatabaseUri } = require('./config');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(getDatabaseUri(), {
  dialect: 'postgres',
  logging: true
});

console.log("Database URI:", getDatabaseUri());


module.exports = {
  sequelize
};
