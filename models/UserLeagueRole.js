module.exports = (sequelize, DataTypes) => {
    const UserLeagueRole = sequelize.define('UserLeagueRole', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      leagueId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // Optionally, you can include additional fields related to the user-league relationship
    }, {
      tableName: 'UserLeagueRoles',
    });
  
    return UserLeagueRole;
  };
  