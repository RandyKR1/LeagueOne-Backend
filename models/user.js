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
      validate: {
        len: [8, 100],
      },
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
  });

  User.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };

  User.authenticate = async function(username, password) {
    const user = await User.findOne({ where: { username } });
  
    if (user && user.validPassword(password)) {
      return {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isLeagueAdmin: user.isLeagueAdmin,
        isTeamAdmin: user.isTeamAdmin,
      };
    }
  
    throw new UnauthorizedError("Invalid username/password");
  };
  
  User.associate = (models) => {
    User.hasMany(models.Team, { as: 'administeredTeams', foreignKey: 'adminId', onDelete:   'CASCADE' });
    User.belongsToMany(models.Team, { through: 'TeamPlayers', as: 'teams', foreignKey:  'userId', onDelete: 'CASCADE' });
    User.hasMany(models.League, { as: 'administeredLeagues', foreignKey: 'adminId',   onDelete: 'CASCADE' });
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
