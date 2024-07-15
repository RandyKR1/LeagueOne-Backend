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
      references: {
        model: 'Users',
        key: 'id'
      },
      unique: 'unique_user_team', // Unique constraint name
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Teams',
        key: 'id'
      },
      unique: 'unique_user_team', // Unique constraint name
    },
  }, {
    tableName: 'TeamPlayers',
  });

  return TeamPlayers;
};
