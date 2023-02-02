const routes = require('next-routes')();

routes
  .add('/geeups/new', '/geeups/new')
  .add('/geeups/:address', '/geeups/show')
  .add('/geeups/:address/requests', '/geeups/requests/index')
  .add('/geeups/:address/requests/new', '/geeups/requests/new');

module.exports = routes;
