'use strict';

const Sequelize = require('sequelize');
const mysql2 = require('mysql2');
const process = require('process');
const env = process.env.NODE_ENV || 'development';
const dbConfigs = require('../config/database');
const config = dbConfigs[env] || dbConfigs.production || dbConfigs.development;
config.dialectModule = mysql2;
const db = {};

let sequelize;
if (config.use_env_variable && process.env[config.use_env_variable]) {
  let dbUrl = process.env[config.use_env_variable];
  try {
    const parsed = new URL(dbUrl);
    const sslParam = parsed.searchParams.get('ssl');
    parsed.searchParams.delete('ssl');
    dbUrl = parsed.toString();

    let sslConfig = {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'
    };

    if (sslParam) {
      try {
        const parsedSsl = JSON.parse(sslParam);
        if (typeof parsedSsl === 'object' && parsedSsl !== null) {
          sslConfig = { ...sslConfig, ...parsedSsl };
        }
      } catch (e) {
        // Ignored if not JSON
      }
    }

    config.dialectOptions = {
      ...(config.dialectOptions || {}),
      ssl: sslConfig
    };
  } catch (err) {
    console.error('Database URL parsing warning:', err.message);
  }

  sequelize = new Sequelize(dbUrl, config);
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
