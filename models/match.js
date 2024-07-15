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
    eventType: {
      type: DataTypes.ENUM('Friendly', 'League', 'Tournament', 'Final'),
      allowNull: false,
    },
    eventLocation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    eventCompetition: {
      type: DataTypes.ENUM(
        'Soccer', 'Football', 'Hockey', 'Basketball',
        'Tennis', 'Golf', 'Baseball', 'Other'
      ),
      allowNull: false,
    },
    eventParticipants: {
      type: DataTypes.STRING, 
      allowNull: false,
    },
    eventResults: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'Matches',
  });

  Match.associate = (models) => {
    // A match belongs to a league
    Match.belongsTo(models.League, { as: 'league', foreignKey: 'leagueId' });
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
