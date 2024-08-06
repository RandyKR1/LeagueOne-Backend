const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  // Define the Team model
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

  /**
   * Validate the given password against the stored hashed password.
   *
   * @param {string} password - The plain text password to validate.
   * @returns {boolean} - Returns true if the password is valid, false otherwise.
   */
  Team.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };

  // Define associations
  Team.associate = (models) => {
    Team.belongsTo(models.User, { as: 'admin', foreignKey: 'adminId', onDelete: 'SET NULL' });
    Team.belongsToMany(models.User, { through: 'TeamPlayers', as: 'players', foreignKey: 'teamId', onDelete: 'CASCADE' });
    Team.belongsToMany(models.League, { through: 'TeamLeagues', as: 'leagues', foreignKey: 'teamId', onDelete: 'CASCADE' });
    Team.hasMany(models.Match, { as: 'matches1', foreignKey: 'team1', onDelete: 'SET NULL' });
    Team.hasMany(models.Match, { as: 'matches2', foreignKey: 'team2', onDelete: 'SET NULL' });
    Team.hasMany(models.Standing, { as: 'standings', foreignKey: 'teamId', onDelete: 'CASCADE' });
  };

  /**
   * Find all teams with optional search filters.
   *
   * @param {Object} searchFilters - Filters to apply to the search.
   * @param {string} [searchFilters.name] - Filter by team name.
   * @param {number} [searchFilters.leagueId] - Filter by league ID.
   * @returns {Promise<Array>} - A promise that resolves to an array of teams matching the filters.
   */
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
