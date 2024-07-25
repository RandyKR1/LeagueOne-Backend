require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/db'); // Import the pre-configured sequelize instance
const { Sequelize } = require('sequelize'); // Import Sequelize for model definitions
const basename = path.basename(__filename);
const db = {};


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

// Export sequelize and models
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

