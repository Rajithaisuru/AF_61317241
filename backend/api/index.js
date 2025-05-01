const app = require('../server');
module.exports = (req, res) => {
  app(req, res); // allow Express to handle the request
};
