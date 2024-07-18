const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Import all models and associate them
fs.readdirSync(__dirname)
  .filter(file => {
    return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Apply associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Synchronize all models with the database
// (async () => {
//   try {
//     await sequelize.sync({ force: true }); // Use { force: true } in development to drop and re-create tables. Remove to save data.
//     console.log('Database synchronized');
//   } catch (error) {
//     console.error('Unable to synchronize database:', error);
//   }
// })();

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
