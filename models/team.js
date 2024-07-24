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
      validate: {
        len: [8, 100],
      },
      set(value) {
        this.setDataValue('password', bcrypt.hashSync(value, 10));
      },
    },
    maxPlayers: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 20,
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  }, {
    tableName: 'Teams',
  });

  Team.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };

  Team.associate = (models) => {
    Team.belongsTo(models.User, { as: 'admin', foreignKey: 'adminId' });
    Team.belongsToMany(models.User, { through: 'TeamPlayers', as: 'players', foreignKey: 'teamId' });
    Team.belongsToMany(models.League, { through: 'TeamLeagues', as: 'leagues', foreignKey: 'teamId' });
    Team.hasMany(models.Match, { as: 'matches1', foreignKey: 'team1' });
    Team.hasMany(models.Match, { as: 'matches2', foreignKey: 'team2' });
    Team.hasMany(models.Standing, { as: 'standings', foreignKey: 'teamId' });
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

    const teams = await Team.findAll({ where, include: 'leagues' });
    return teams;
  };

  return Team;
};
