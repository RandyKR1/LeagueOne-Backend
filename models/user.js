const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { UnauthorizedError } = require('../expressError');

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
    },
    bio: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isLeagueAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isTeamAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'Users',
    hooks: {
      // Hash password before saving new or updated user
      beforeCreate: async (user) => {
        if (user.password) {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          user.password = hashedPassword;
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          user.password = hashedPassword;
        }
      },
    },
    getterMethods: {
      name() {
        return `${this.firstName} ${this.lastName}`;
      },
    },
  });



  

  // Define custom instance method for validating password
  User.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };

  // Define authenticate method for user authentication
  User.authenticate = async function(username, password) {
    // Find the user by username
    const user = await User.findOne({ where: { username } });

    if (user && user.validPassword(password)) {
      // Return user object without password field
      return {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
      };
    }

    throw new UnauthorizedError("Invalid username/password");
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
