'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Quiz extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Quiz.hasMany(models.Question, {
        foreignKey: 'quiz_id',
        as: 'questions',
        onDelete: 'CASCADE',
      });
      Quiz.belongsTo(models.Organization, { foreignKey: 'organization_id' });
    }
  }
  Quiz.init({
    organization_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    month: DataTypes.STRING,
    total_marks: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Quiz',
  });
  return Quiz;
};