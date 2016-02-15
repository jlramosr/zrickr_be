var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt  = require('passport-jwt').ExtractJwt;

var authConfig  = require('./auth');

var model = require('../models/users');

var passportConfig = function (passport) {

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    model.findById(id, function(err, user) {
      done(err, user);
    });
  });

  var opts = {}
  opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
  opts.secretOrKey = authConfig.secret;

  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    model.findOne({id: jwt_payload.id}, function(err, user) {
      if (err) return done(err, false);
      if (user) done(null, user);
      else done(null, false);
    });
  }));

};

module.exports = passportConfig;
