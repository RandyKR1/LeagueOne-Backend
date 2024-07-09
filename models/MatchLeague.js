module.exports = (sequelize, DataTypes) => {
    const MatchLeague = sequelize.define('MatchLeague', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      matchId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      leagueId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // Optionally, you can include additional fields related to the match-league relationship
    }, {
      tableName: 'MatchLeagues',
    });
  
    return MatchLeague;
  };
  