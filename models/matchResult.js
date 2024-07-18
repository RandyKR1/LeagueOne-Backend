module.exports = (sequelize, DataTypes) => {
    const MatchResult = sequelize.define('MatchResult', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      matchId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Matches',
          key: 'id',
        },
      },
      participant1Score: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      participant2Score: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    }, {
      tableName: 'MatchResults',
    });
  
    MatchResult.associate = (models) => {
      MatchResult.belongsTo(models.Match, { as: 'match', foreignKey: 'matchId' });
    };
  
    return MatchResult;
  };
  