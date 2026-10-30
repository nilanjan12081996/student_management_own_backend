const app = require('../src/app');

module.exports = (req, res) => {
  return app(req, res);
};
module.exports.default = module.exports;
