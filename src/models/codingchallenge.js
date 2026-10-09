'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CodingChallenge extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  CodingChallenge.init({
    title: DataTypes.STRING,
    type: DataTypes.ENUM('practice', 'competitive'),
    month: DataTypes.STRING,
    problem_statement: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'CodingChallenge',
  });
  return CodingChallenge;
};