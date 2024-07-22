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
    team1: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Teams', // Adjust based on your actual model name
        key: 'id',
      }
    },
    team2: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Teams', // Adjust based on your actual model name
        key: 'id'
      }
    },
    team1Score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    team2Score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'Matches'
  });

  Match.associate = (models) => {
    Match.belongsTo(models.League, { as: 'league', foreignKey: 'leagueId' });
    Match.belongsTo(models.Team, { as: 'homeTeam', foreignKey: 'team1' });
    Match.belongsTo(models.Team, { as: 'awayTeam', foreignKey: 'team2' });
  };


  return Match;
};
