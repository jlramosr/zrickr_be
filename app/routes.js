var path              = require('path');
var express           = require('express');

var path_controllers  = 'controllers';

var bodyParser        = require('body-parser');
var jsonParser        = bodyParser.json();


var routes = function(app, passport) {

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
    .get( '/',
          passport.authenticate('jwt', {session: false}),
          users_controller.findUsers) //get users
    .get( '/profile',
          passport.authenticate('jwt', {session: false}),
          users_controller.profile) //get user
    .post('/signup',
          jsonParser,
          users_controller.createUser) //signup
    .post('/login',
          jsonParser,
          users_controller.login); //login
    /*.get('/logout', users_controller.logout); //logout*/
  app.use('/users', users_router);


  // Films routes
  var films_controller = require(path.join(__dirname, path_controllers, 'films')),
  films_router = express.Router()
    .get( '/:id?',
          passport.authenticate('jwt', {session: false}),
          films_controller.findFilms)
    .post('/',
          passport.authenticate('jwt', {session: false}),
          jsonParser,
          films_controller.insertFilm)
    .put( '/:id?',
          passport.authenticate('jwt', {session: false}),
          jsonParser,
          films_controller.updateFilm)
    .delete('/:id?',
          passport.authenticate('jwt', {session: false}),
          jsonParser,
          films_controller.deleteFilms);

  app.use('/films', films_router);

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
