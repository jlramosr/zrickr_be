var express = require('express');

const LocalStrategy = require('passport-local');

var authConfig  = require('./config/auth');

var model = require('./models/users');

var session = function(app, passport) {

  app.use(passport.initialize());

  passport.use(new LocalStrategy(
    function(username, password, done) {
      model.model.findOne( {'local.email': username}, function(err, user) {
        if (err) return done(err, false);
        if (user) {
          user.comparePassword(password, function (err, isMatch) {
            if (isMatch && !err) done(null, user);
            else done(err, false);
            //return errorConfig.manageError(res, err, 401, 'Authentication Error', 'Wrong Password', 'Wrong Password');
          });
        }
        else done(null, false)
      });
      /*if(username === 'devils name' && password === '666'){
        done(null, {
          id: 666,
          firstname: 'devils',
          lastname: 'name',
          email: 'devil@he.ll',
          verified: true
        });
      }
      else {
        done(null, false);
      }*/
    }));
}

module.exports = session;
