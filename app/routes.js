var path              = require('path');
var express           = require('express');

var path_controllers  = 'controllers';
var errors            = require('./config/error');

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
              if (err) return errors.json(res, new errors.Http401Error(info.message));
              if (!user) return errors.json(res, new errors.Http401Error(info.message));
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


  // Collections routes
  var collections_controller = require(path.join(__dirname, path_controllers, 'collections')),
  collections_router = express.Router()
    .get( '/:id?',
          collections_controller.get)
    .post('/:id?',
          jsonParser,
          collections_controller.insert)
    .delete('/:id?',
          jsonParser,
          collections_controller.delete);
  app.use(nameMainRoute + '/collections', collections_router);


  // Zrickers routes
  var zrickers_controller = require(path.join(__dirname, path_controllers, 'zrickers')),
  zrickers_router = express.Router()
    .get( '/:collectionId?/:zrickrId?',
          zrickers_controller.get)
    .post('/',
          jsonParser,
          zrickers_controller.insert)
    .delete('/:collectionId?/:zrickrId?',
          jsonParser,
          zrickers_controller.delete);
  app.use(nameMainRoute + '/zrickers', zrickers_router);


  // Public routes
  public_router = express.Router()
    .get( '/collections/:id?',
          collections_controller.getPublic);
  app.use(nameMainRoute + '/public', public_router);

  // Shared routes
  shared_router = express.Router()
    .get( '/collections/:id?',
          collections_controller.getShared)
    .get( '/zrickers/:collectionId?/:zrickrId?',
          zrickers_controller.getShared);
  app.use(nameMainRoute + '/shared', shared_router);

  //Error Middlewares
  app.use(function(req, res, next) {
    var err = new Error('Endpoint undefined');
    err.status = 404;
    next(err);
  });
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    return errors.json(res, err);
  });
}

module.exports = routes;
