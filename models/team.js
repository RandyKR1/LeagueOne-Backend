const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  const Team = sequelize.define('Team', {
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
    maxPlayers: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 20,
    },
    leagueId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Leagues', // name of the target model
        key: 'id', // key in the target model
      },
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users', // name of the target model
        key: 'id', // key in the target model
      },
    },
  }, {
    tableName: 'Teams',
  });

  // Define custom instance method for validating team password
  Team.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };

  Team.associate = (models) => {
    // A team can have one admin (user)
    Team.belongsTo(models.User, { as: 'admin', foreignKey: 'adminId' });
    // A team can have many players (users)
    Team.belongsToMany(models.User, { through: 'TeamPlayers', as: 'players' });
    // A team belongs to one league
    Team.belongsTo(models.League, { as: 'league', foreignKey: 'leagueId' });
    // A team can participate in many matches
    Team.belongsToMany(models.Match, { through: 'MatchTeams', as: 'matches' });
  };

  Team.findAllWithFilters = async (searchFilters = {}) => {
    const where = {};
  
    const { name, leagueId } = searchFilters;
  
    if (name) {
      where.name = { [Op.iLike]: `%${name}%` };
    }
  
    if (leagueId) {
      where.leagueId = leagueId;
    }
  
    const teams = await Team.findAll({ where });
    return teams;
  };

  return Team;
};
