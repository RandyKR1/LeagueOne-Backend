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
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    leagueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Leagues',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  }, {
    tableName: 'TeamLeagues',
  });

  return TeamLeagues;
};
