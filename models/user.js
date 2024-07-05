const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value) {
        this.setDataValue('password', bcrypt.hashSync(value, 10));
      },
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  }, {
    tableName: 'Users',
  });

  // Define custom instance method for validating password
  User.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };

  // Define associations
  User.associate = (models) => {
    // A user can be an admin of many teams
    User.hasMany(models.Team, { as: 'administeredTeams', foreignKey: 'adminId' });
    // A user can belong to many teams as a player
    User.belongsToMany(models.Team, { through: 'TeamPlayers', as: 'teams' });
    // A user can be an admin of many leagues
    User.hasMany(models.League, { as: 'administeredLeagues', foreignKey: 'adminId' });
    // A user can belong to many leagues as a member
    User.belongsToMany(models.League, { through: 'LeagueMembers', as: 'leagues' });
  };

  User.findAllWithFilters = async (searchFilters = {}) => {
    const where = {};
  
    const { firstName, lastName, email, username } = searchFilters;
  
    if (firstName) {
      where.firstName = { [Op.iLike]: `%${firstName}%` };
    }
  
    if (lastName) {
      where.lastName = { [Op.iLike]: `%${lastName}%` };
    }
  
    if (email) {
      where.email = { [Op.iLike]: `%${email}%` };
    }
  
    if (username) {
      where.username = { [Op.iLike]: `%${username}%` };
    }
  
    const users = await User.findAll({ where });
    return users;
  };
  

  return User;
};
