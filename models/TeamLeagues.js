// TeamLeagues model definition
module.exports = (sequelize, DataTypes) => {
    const TeamLeagues = sequelize.define('TeamLeagues', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      teamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Teams',
          key: 'id'
        },
        unique: 'unique_team_league', // Unique constraint name (optional)
      },
      leagueId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Leagues',
          key: 'id'
        },
        unique: 'unique_team_league', // Unique constraint name (optional)
      },
    }, {
      tableName: 'TeamLeagues',
    });
  
    return TeamLeagues;
  };
  