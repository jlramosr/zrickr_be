var path              = require('path');
var express           = require('express');

var path_controllers  = 'controllers';
var errorConfig       = require('./config/error');

var bodyParser        = require('body-parser');
var jsonParser        = bodyParser.json();


var routes = function(app, passport) {

  _authorizate = function(req,res,next)  {
    passport.authenticate('jwt', function(err, user, info) {
      if (err) return next(err);
      if (!user) return errorConfig.manageError(res, err, 403, 'Authorization Error', 'Authorization Error', info.message || '');
      next();
    })(req, res, next)
  };

  app.use(bodyParser.json());

  // Index routes
  var index_controller = require(path.join(__dirname, path_controllers, 'index'));
  index_router = express.Router()
    .get( '/',
          index_controller.get);
  app.use('/', index_router);


  // Users routes
  var users_controller = require(path.join(__dirname, path_controllers, 'users'));
  users_router = express.Router()
    .get( '/:id?',
          _authorizate,
          users_controller.findUser, //get users
          users_controller.profile, // /profile
          users_controller.logout) // /logout
    .post('/',
          jsonParser,
          users_controller.createUser) //signup
    .post('/login',
          jsonParser,
          users_controller.login) //login
    .put( '/:id?',
          jsonParser,
          _authorizate,
          users_controller.updateUser) //updateUser
    .delete('/:id?',
            jsonParser,
            _authorizate,
            users_controller.deleteUser); //signout

  app.use('/users', users_router);



  // Films routes
  var films_controller = require(path.join(__dirname, path_controllers, 'films')),
  films_router = express.Router()
    .get( '/:id?',
          jsonParser,
          _authorizate,
          films_controller.findFilm)
    .post('/',
          jsonParser,
          _authorizate,
          films_controller.insertFilm)
    .put( '/:id?',
          jsonParser,
          _authorizate,
          films_controller.updateFilm)
    .delete('/:id?',
          jsonParser,
          _authorizate,
          films_controller.deleteFilm);

  app.use('/films', films_router);

  //Error Middlewares
  app.use(function(req, res, next) {
    var err = new Error('Endpoint undefined');
    err.status = 404;
    next(err);
  });
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    errorConfig.manageError(res, err, err.status, 'Internal Error', err.message );
  });
}

module.exports = routes;
