'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Submission extends Model {
    static associate(models) {
      Submission.belongsTo(models.Organization, { foreignKey: 'organization_id' });
      Submission.belongsTo(models.Quiz, { foreignKey: 'quiz_id' });
      Submission.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  Submission.init({
    organization_id: DataTypes.INTEGER,
    quiz_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    score: DataTypes.INTEGER,
    total_marks: DataTypes.INTEGER,
    answers_json: DataTypes.TEXT,
    feedback: DataTypes.TEXT,
    graded_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Submission',
  });
  return Submission;
};
