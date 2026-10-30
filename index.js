require('dotenv').config();
const app = require('./src/app');

// Vercel needs the app exported as module.exports
// This file is the entrypoint declared in package.json "main": "index.js"
module.exports = app;
module.exports.default = app;
module.exports.app = app;
module.exports.handler = (req, res) => app(req, res);
