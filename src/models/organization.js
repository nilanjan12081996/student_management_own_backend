'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Organization extends Model {
    static associate(models) {
      Organization.hasMany(models.User, { foreignKey: 'organization_id' });
      Organization.hasMany(models.Quiz, { foreignKey: 'organization_id' });
      Organization.hasMany(models.Note, { foreignKey: 'organization_id' });
    }
  }
  Organization.init({
    name: DataTypes.STRING,
    slug: DataTypes.STRING,
    owner_name: DataTypes.STRING,
    email: DataTypes.STRING,
    plan: DataTypes.ENUM('starter', 'pro', 'enterprise'),
    status: DataTypes.ENUM('active', 'suspended')
  }, {
    sequelize,
    modelName: 'Organization',
  });
  return Organization;
};
