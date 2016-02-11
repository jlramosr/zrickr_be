var path              = require('path');
var express           = require('express');

var path_controllers  = 'controllers';

var bodyParser        = require('body-parser');
var jsonParser        = bodyParser.json();


var routes = function(app) {

  // Index routes
  var index_controller = require(path.join(__dirname, path_controllers, 'index'));
  index_router = express.Router();
  app.use('/', index_router);
  index_router.get('/', index_controller.get);

  // Users routes
  var users_controller = require(path.join(__dirname, path_controllers, 'users'));
  users_router = express.Router();
  app.use('/users', users_router);
  users_router.get('/', users_controller.get);

  // Films routes
  var films_controller = require(path.join(__dirname, path_controllers, 'films')),
  films_router = express.Router();
  app.use('/films', films_router);
  films_router.get('/:id?', films_controller.findFilms);
  films_router.post('/', jsonParser, films_controller.insertFilm);
  films_router.put('/:id?', jsonParser, films_controller.updateFilm);
  films_router.delete('/:id?', jsonParser, films_controller.deleteFilms);

  // Middlewares
  app.use(function(req, res, next) {
    var err = new Error('Endpoint undefined');
    err.status = 404;
    next(err);
  });
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log('Internal error(%d): %s', err.status, err.message);
    res.json({ error: err.message} );
  });
}

module.exports = routes;
