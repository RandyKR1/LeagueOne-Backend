module.exports = (sequelize, DataTypes) => {
  const Standing = sequelize.define('Standing', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    leagueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Leagues',
        key: 'id',
      },
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
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    wins: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    losses: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    draws: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    tableName: 'Standings',
  });

  Standing.associate = (models) => {
    Standing.belongsTo(models.League, { as: 'league', foreignKey: 'leagueId', onDelete: 'CASCADE', });
    Standing.belongsTo(models.Team, { as: 'team', foreignKey: 'teamId', onDelete: 'CASCADE', });
  };

  Standing.findByLeagueAndTeam = async function(leagueId, teamId) {
    return await this.findOne({
      where: { leagueId, teamId },
    });
  };
  
  Standing.prototype.updatePoints = async function(points) {
    this.points = points;
    await this.save();
  };
  
  Standing.prototype.updateRecord = async function(wins, losses, draws) {
    this.wins = wins;
    this.losses = losses;
    this.draws = draws;
    await this.save();
  };
  

  return Standing;
};
