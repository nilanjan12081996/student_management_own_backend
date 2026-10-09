'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Question.belongsTo(models.Organization, { foreignKey: 'organization_id' });
      Question.belongsTo(models.Quiz, {
        foreignKey: 'quiz_id',
        as: 'quiz'
      });
    }
  }

  Question.init({
    organization_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quiz_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    question_text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    options: {
      type: DataTypes.JSON,
      allowNull: true
    },
    correct_answer: {
      type: DataTypes.STRING,
      allowNull: false
    },
    marks: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Question',
  });

  return Question;
};
