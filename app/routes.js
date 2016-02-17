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

  // Auth Middleware - This will check if the token is valid
  // Only the requests that start with /api/v1/* will be checked for the token.
  // Any URL's that do not follow the below pattern should be avoided unless you
  // are sure that authentication is not needed
  //app.all('/api/*', [require('./middlewares/validateRequest')]);





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
          users_controller.get) //get users
    .post('/',
          jsonParser,
          users_controller.create) //signup
    .put( '/:id?',
          jsonParser,
          users_controller.update) //updateUser
    .delete('/:id?',
            jsonParser,
            users_controller.delete); //signout
  app.use(nameMainRoute + '/users', users_router);



  // Films routes
  var films_controller = require(path.join(__dirname, path_controllers, 'films')),
  films_router = express.Router()
    .get( '/:id?',
          jsonParser,
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



  // Auth routes
  var auth_controller = require(path.join(__dirname, path_controllers, 'auth'));
  auth_router = express.Router()
    .post('/signup',
          jsonParser,
          users_controller.create) //signup
    .post('/login',
          jsonParser,
          function (req, res, next) {
            passport.authenticate('local', function(err, user, info) {
              if (err) return next(err);
              if (!user) return errorConfig.manageError(res, err, 403, 'Authorization Error', 'Authorization Error');
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
          auth_controller.profile) //profile
    .get( '/logout',
          auth_controller.logout); //logout
  app.use('/', auth_router);



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
