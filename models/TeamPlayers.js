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
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Teams',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  }, {
    tableName: 'TeamPlayers',
  });

  return TeamPlayers;
};
