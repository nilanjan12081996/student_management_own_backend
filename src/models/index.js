'use strict';

const Sequelize = require('sequelize');
const process = require('process');
const env = process.env.NODE_ENV || 'development';
const dbConfigs = require('../config/database');
const config = dbConfigs[env] || dbConfigs.production || dbConfigs.development;
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Explicit model imports ensure Vercel and serverless bundlers trace and package all models
const modelDefiners = [
  require('./batch'),
  require('./codingchallenge'),
  require('./note'),
  require('./organization'),
  require('./payment'),
  require('./question'),
  require('./quiz'),
  require('./studentprogress'),
  require('./submission'),
  require('./user'),
];

modelDefiners.forEach(modelDefiner => {
  const model = modelDefiner(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
});

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
