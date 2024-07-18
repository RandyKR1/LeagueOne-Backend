module.exports = (sequelize, DataTypes) => {
  const Match = sequelize.define('Match', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    leagueId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    eventType: {
      type: DataTypes.ENUM('Friendly', 'League', 'Tournament', 'Final'),
      allowNull: false,
    },
    eventLocation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    team1: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Teams', // Adjust based on your actual model name
        key: 'id',
      }
    },
    team2: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Teams', // Adjust based on your actual model name
        key: 'id'
      }
    },
    team1Score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    team2Score: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'Matches'
  });

  Match.associate = (models) => {
    Match.belongsTo(models.League, { as: 'league', foreignKey: 'leagueId' });
    Match.belongsTo(models.Team, { as: 'homeTeam', foreignKey: 'team1' });
    Match.belongsTo(models.Team, { as: 'awayTeam', foreignKey: 'team2' });
  };

  Match.prototype.updateStandings = async function() {
    const league = await this.getLeague();

    // Initialize variables to track points and results
    let team1Points = 0;
    let team2Points = 0;
    let team1Result = '';
    let team2Result = '';

    // Determine match result and points distribution
    if (this.team1Score > this.team2Score) {
      team1Points = league.firstPlacePoints;
      team2Points = league.secondPlacePoints;
      team1Result = 'win';
      team2Result = 'loss';
    } else if (this.team1Score < this.team2Score) {
      team1Points = league.secondPlacePoints;
      team2Points = league.firstPlacePoints;
      team1Result = 'loss';
      team2Result = 'win';
    } else {
      team1Points = league.drawPoints;
      team2Points = league.drawPoints;
      team1Result = 'draw';
      team2Result = 'draw';
    }

    // Update standings for team1
    const team1Standing = await league.getStanding(this.team1);
    if (team1Standing) {
      if (team1Result === 'win') {
        await team1Standing.increment('wins');
      } else if (team1Result === 'loss') {
        await team1Standing.increment('losses');
      } else {
        await team1Standing.increment('draws');
      }
      await team1Standing.updatePoints(team1Points);
    }

    // Update standings for team2
    const team2Standing = await league.getStanding(this.team2);
    if (team2Standing) {
      if (team2Result === 'win') {
        await team2Standing.increment('wins');
      } else if (team2Result === 'loss') {
        await team2Standing.increment('losses');
      } else {
        await team2Standing.increment('draws');
      }
      await team2Standing.updatePoints(team2Points);
    }
  };

  Match.addHook('afterCreate', async (match) => {
    await match.updateStandings(); // Call updateStandings after match creation
  });

  Match.addHook('afterUpdate', async (match) => {
    await match.updateStandings(); // Call updateStandings after match update
  });
  return Match;
};
