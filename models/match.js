module.exports = (sequelize, DataTypes) => {
  // Define the Match model
  const Match = sequelize.define('Match', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    leagueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE',
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
        model: 'Teams',  // Reference to the Teams model
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    team2: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Teams',  // Reference to the Teams model
        key: 'id'
      },
      onDelete: 'SET NULL',
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
    tableName: 'Matches'  // Specify the table name
  });

  // Define associations
  Match.associate = (models) => {
    Match.belongsTo(models.League, { as: 'league', foreignKey: 'leagueId' });
    Match.belongsTo(models.Team, { as: 'homeTeam', foreignKey: 'team1' });
    Match.belongsTo(models.Team, { as: 'awayTeam', foreignKey: 'team2' });
  };

  return Match;
};
