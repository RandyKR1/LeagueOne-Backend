module.exports = (sequelize, DataTypes) => {
  // Define the Standing model
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
        model: 'Leagues', // Reference to the Leagues model
        key: 'id',
      },
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Teams', // Reference to the Teams model
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
    tableName: 'Standings',  // Specify the table name
  });

  // Define associations
  Standing.associate = (models) => {
    Standing.belongsTo(models.League, { as: 'league', foreignKey: 'leagueId', onDelete: 'CASCADE' });
    Standing.belongsTo(models.Team, { as: 'team', foreignKey: 'teamId', onDelete: 'CASCADE' });
  };

  /**
   * Find a standing by league and team.
   *
   * @param {number} leagueId - The ID of the league.
   * @param {number} teamId - The ID of the team.
   * @returns {Promise<Object|null>} - A promise that resolves to the standing or null if not found.
   */
  Standing.findByLeagueAndTeam = async function(leagueId, teamId) {
    return await this.findOne({
      where: { leagueId, teamId },
    });
  };

  /**
   * Update the points of the standing.
   *
   * @param {number} points - The new points value.
   * @returns {Promise<void>} - A promise that resolves when the points have been updated.
   */
  Standing.prototype.updatePoints = async function(points) {
    this.points = points;
    await this.save();
  };

  /**
   * Update the record of the standing.
   *
   * @param {number} wins - The new number of wins.
   * @param {number} losses - The new number of losses.
   * @param {number} draws - The new number of draws.
   * @returns {Promise<void>} - A promise that resolves when the record has been updated.
   */
  Standing.prototype.updateRecord = async function(wins, losses, draws) {
    this.wins = wins;
    this.losses = losses;
    this.draws = draws;
    await this.save();
  };

  return Standing;
};
