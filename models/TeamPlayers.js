// TeamPlayers.js
module.exports = (sequelize, DataTypes) => {
    const TeamPlayers = sequelize.define('TeamPlayers', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      teamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // Optionally, you can include additional fields like role, etc.
    }, {
      tableName: 'TeamPlayers',
    });
  
    return TeamPlayers;
  };
  