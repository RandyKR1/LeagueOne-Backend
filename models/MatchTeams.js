// MatchTeams.js
module.exports = (sequelize, DataTypes) => {
    const MatchTeams = sequelize.define('MatchTeams', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      matchId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      teamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // Optionally, you can include additional fields related to the match-team relationship
    }, {
      tableName: 'MatchTeams',
    });
  
    return MatchTeams;
  };
  