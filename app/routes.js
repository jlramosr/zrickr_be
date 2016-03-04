var path              = require('path');
var express           = require('express');

var path_controllers  = 'controllers';
var errorConfig       = require('./config/error');

var bodyParser        = require('body-parser');
var jsonParser        = bodyParser.json();

const nameMainRoute   = "/api";


var routes = function(app, passport) {

  app.use(bodyParser.json());

  app.all('/*', function(req, res, next) {
    // CORS headers
    res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // Set custom headers for CORS
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
    if (req.method == 'OPTIONS') res.status(200).end();
    else next();
  });


  // Auth routes
  var users_controller = require(path.join(__dirname, path_controllers, 'users'));
  var auth_controller = require(path.join(__dirname, path_controllers, 'auth'));
  app.all('/api/*', [auth_controller.authenticate]); //All API routes will need authorization
  auth_router = express.Router()
    .post('/signup',
          jsonParser,
          users_controller.create) //signup
    .post('/login',
          jsonParser,
          function (req, res, next) {
            passport.authenticate('local', function(err, user, info) {
              if (err) return errorConfig.manageError(res, err, 403, 'Authorization Error', 'Authorization Error', info.message)
              if (!user) return errorConfig.manageError(res, err, 403, 'Authorization Error', 'Authorization Error', info.message);
              else {
                req.user = user;
                next();
              }
            })(req, res, next);
          },
          auth_controller.serialize,
          auth_controller.generateToken,
          auth_controller.login) //login
    .get( '/profile',
          auth_controller.authenticate,
          auth_controller.profile,
          users_controller.get) //get profile
    .get( '/signout',
          auth_controller.authenticate,
          auth_controller.profile,
          users_controller.delete) //signout
    .put( '/profile/update',
          auth_controller.authenticate,
          auth_controller.profile,
          users_controller.update) //update profile
  app.use('/', auth_router);

  // Users routes
  users_router = express.Router()
    .get( '/:id?',
          users_controller.get) //get users
  app.use(nameMainRoute + '/users', users_router);



  // Index routes
  var index_controller = require(path.join(__dirname, path_controllers, 'index'));
  index_router = express.Router()
    .get( '/',
          index_controller.get);
  app.use('/', index_router);


  // Collections routes
  var collections_controller = require(path.join(__dirname, path_controllers, 'zrickers')).collectionController,
  collections_router = express.Router()
    .get( '/:id?',
          collections_controller.getCollections,
          collections_controller.get)
    .post('/',
          jsonParser,
          collections_controller.insert)
    .delete('/:id?',
          jsonParser,
          collections_controller.delete);
  app.use(nameMainRoute + '/collections', collections_router);


  // Zrickers routes
  var zrickers_controller = require(path.join(__dirname, path_controllers, 'zrickers')).zrickrController,
  zrickers_router = express.Router()
    .get( '/:nameCollection?',
          collections_controller.getCollections,
          zrickers_controller.get)
    .post('/',
          jsonParser,
          zrickers_controller.insert)
    .delete('/:id?',
          jsonParser,
          zrickers_controller.delete);
  app.use(nameMainRoute + '/zrickers', zrickers_router);


  // Films routes
  var films_controller = require(path.join(__dirname, path_controllers, 'films')),
  films_router = express.Router()
    .get( '/:id?',
          films_controller.get)
    .post('/',
          jsonParser,
          films_controller.insert)
    .put( '/:id?',
          jsonParser,
          films_controller.update)
    .delete('/:id?',
          jsonParser,
          films_controller.delete);
  app.use(nameMainRoute + '/films', films_router);



  //Error Middlewares
  app.use(function(req, res, next) {
    var err = new Error('Endpoint undefined');
    err.status = 404;
    next(err);
  });
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    errorConfig.manageError(res, err, err.status, 'Internal Error', err.message);
  });
}

module.exports = routes;
