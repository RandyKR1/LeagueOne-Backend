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
      validate: {
        len: [8, 100],
      },
      set(value) {
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
        model: 'Users',
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
    tableName: 'Leagues',
  });

  League.associate = (models) => {
    League.belongsTo(models.User, { as: 'admin', foreignKey: 'adminId', onDelete:   'CASCADE' });
    League.belongsToMany(models.Team, { through: 'TeamLeagues', as: 'teams', foreignKey:  'leagueId', onDelete: 'CASCADE' });
    League.hasMany(models.Match, { as: 'matches', foreignKey: 'leagueId', onDelete:   'CASCADE' });
    League.hasMany(models.Standing, { as: 'standings', foreignKey: 'leagueId', onDelete:  'CASCADE' });
  };

  League.prototype.getSortedStandings = async function() {
    return await this.getStandings({ order: [['points', 'DESC']] });
  };

  League.prototype.getNumberOfTeams = async function() {
    const teams = await this.getTeams();
    return teams.length;
  };
  
  League.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };  
  
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
