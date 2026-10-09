'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StudentProgress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      StudentProgress.belongsTo(models.Organization, { foreignKey: 'organization_id' });
    }
  }
  StudentProgress.init({
    organization_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    task_id: DataTypes.INTEGER,
    task_type: DataTypes.ENUM('quiz', 'coding'),
    score: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'StudentProgress',
  });
  return StudentProgress;
};