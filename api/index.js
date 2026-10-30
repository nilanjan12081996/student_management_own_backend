const app = require('../src/app');

module.exports = app;
module.exports.default = app;
module.exports.app = app;
module.exports.handler = (req, res) => app(req, res);
