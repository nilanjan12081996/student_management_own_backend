'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Batch extends Model {
    static associate(models) {
      Batch.belongsTo(models.Organization, { foreignKey: 'organization_id' });
    }
  }
  Batch.init({
    organization_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    subject: DataTypes.STRING,
    join_code: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Batch',
  });
  return Batch;
};
