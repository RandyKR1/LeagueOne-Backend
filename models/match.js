const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Match = sequelize.define('Match', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      leagueId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      eventName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      eventLocation: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      eventType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      eventResults: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      creatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    }, {
      tableName: 'Matches',
    });
  
    Match.associate = (models) => {
      // A match belongs to a league
      Match.belongsTo(models.League, { as: 'league', foreignKey: 'leagueId' });
      // A match has a creator (user)
      Match.belongsTo(models.User, { as: 'creator', foreignKey: 'creatorId' });
      // A match can have many teams (as participants)
      Match.belongsToMany(models.Team, { through: 'MatchTeams', as: 'teams' });
    };

    Match.findAllWithFilters = async (searchFilters = {}) => {
      const where = {};
    
      const { date, teamId, leagueId } = searchFilters;
    
      if (date) {
        where.date = date;
      }
    
      if (teamId) {
        where.teamId = teamId;
      }
    
      if (leagueId) {
        where.leagueId = leagueId;
      }
    
      const matches = await Match.findAll({ where });
      return matches;
    };
  
    return Match;
  };
  