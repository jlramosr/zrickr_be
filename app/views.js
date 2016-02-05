var path = require('path'),
    path_views = 'views';

var views = function(app) {
  app.set('views', path.join(__dirname, path_views));
  app.set('view engine', 'jade');
}

module.exports = views;
