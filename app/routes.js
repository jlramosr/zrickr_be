var path = require('path'),
    express = require('express'),
    path_controllers = 'controllers',
    bodyParser  = require('body-parser'),
    jsonParser =  bodyParser.json(),
    index_controller = require(path.join(__dirname, path_controllers, 'index')),
    films_controller = require(path.join(__dirname, path_controllers, 'films')),
    users_controller = require(path.join(__dirname, path_controllers, 'users'));

var routes = function(app) {

  // Index routes
  app.use('/', index_controller);

  // Users routes
  app.use('/users', users_controller);

  // Films routes
  var films_router = express.Router();
  app.use('/films', films_router);
  films_router.get('/:title?', films_controller.select);
  films_router.post('/', jsonParser, films_controller.insert);
  films_router.put('/:title?', jsonParser, films_controller.update);
  films_router.delete('/', jsonParser, films_controller.delete);

  // Middlewares
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });
}

module.exports = routes;
