const bcrypt = require('bcrypt');  // Import bcrypt for hashing passwords
const { Op } = require('sequelize');  // Import Sequelize operators

module.exports = (sequelize, DataTypes) => {
  // Define the League model
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
      validate: {
        len: [8, 100],
      },
      set(value) {
        // Hash the password before saving it to the database
        this.setDataValue('password', bcrypt.hashSync(value, 10));
      },
    },
    maxTeams: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    competition: {
      type: DataTypes.ENUM(
        'Soccer', 'Football', 'Hockey', 'Basketball',
        'Tennis', 'Golf', 'Baseball', 'Other'
      ),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',  // Reference to the Users model
        key: 'id',
      },
    },
    firstPlacePoints: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    secondPlacePoints: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    drawPoints: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'Leagues',  // Specify the table name
  });

  // Define associations
  League.associate = (models) => {
    League.belongsTo(models.User, { as: 'admin', foreignKey: 'adminId', onDelete: 'CASCADE' });
    League.belongsToMany(models.Team, { through: 'TeamLeagues', as: 'teams', foreignKey: 'leagueId', onDelete: 'CASCADE' });
    League.hasMany(models.Match, { as: 'matches', foreignKey: 'leagueId', onDelete: 'CASCADE' });
    League.hasMany(models.Standing, { as: 'standings', foreignKey: 'leagueId', onDelete: 'CASCADE' });
  };

  /**
   * Get the standings for the league sorted by points in descending order.
   * 
   * @returns {Promise<Array>} - A promise that resolves to the sorted standings
   */
  League.prototype.getSortedStandings = async function() {
    return await this.getStandings({ order: [['points', 'DESC']] });
  };

  /**
   * Get the number of teams in the league.
   * 
   * @returns {Promise<number>} - A promise that resolves to the number of teams
   */
  League.prototype.getNumberOfTeams = async function() {
    const teams = await this.getTeams();
    return teams.length;
  };

  /**
   * Validate the given password against the hashed password stored in the database.
   * 
   * @param {string} password - The password to validate
   * @returns {boolean} - True if the password is valid, false otherwise
   */
  League.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };

  /**
   * Find all leagues that match the given search filters.
   * 
   * @param {Object} searchFilters - The search filters
   * @param {string} [searchFilters.name] - The name filter
   * @param {number} [searchFilters.maxTeams] - The maximum number of teams filter
   * @returns {Promise<Array>} - A promise that resolves to the leagues that match the filters
   */
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
