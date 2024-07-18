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
    score: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'MatchTeams',
  });

  return MatchTeams;
};
