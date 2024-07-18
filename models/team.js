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
        model: 'Leagues',
        key: 'id',
      },
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
    Team.belongsTo(models.League, { as: 'league', foreignKey: 'leagueId' });
    Team.belongsToMany(models.Match, { through: 'MatchTeams', as: 'matches', foreignKey: 'teamId' });
    Team.belongsToMany(models.League, { through: 'TeamLeagues', as: 'leagues', foreignKey: 'teamId' });
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

    const teams = await Team.findAll({ where });
    return teams;
  };

  return Team;
};
