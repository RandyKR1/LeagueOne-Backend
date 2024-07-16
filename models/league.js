const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const League = sequelize.define('League', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
      set(value) {
        this.setDataValue('password', bcrypt.hashSync(value, 10));
      },
    },
    maxTeams: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  }, {
    tableName: 'Leagues',
  });

  League.associate = (models) => {
    // A league can have one admin (user)
    League.belongsTo(models.User, { as: 'admin', foreignKey: 'adminId' });
    League.belongsToMany(models.Team, { through: 'TeamLeagues', as: 'teams', foreignKey: 'leagueId' });
    // A league can have many matches
    League.hasMany(models.Match, { as: 'matches', foreignKey: 'leagueId' });
  };

   // Define the static method findAllWithFilters
   League.findAllWithFilters = async function(searchFilters = {}) {
    const where = {};

    const { name, maxTeams } = searchFilters;

    if (name) {
      where.name = { [Op.iLike]: `%${name}%` };
    }

    if (maxTeams) {
      where.maxTeams = { [Op.lte]: maxTeams };
    }
    return await League.findAll({ where });
  };

  return League;
};
