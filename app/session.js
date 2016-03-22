var express = require('express');

const LocalStrategy = require('passport-local');

var authConfig  = require('./config/auth');

var model = require('./models/users');

var session = function(app, passport) {

  app.use(passport.initialize());

  passport.use(new LocalStrategy(
    function(username, password, done) {
      model.model.findOne( {'local.email': username}, function(err, user) {
        if (err) return done(err);
        if (!user) done(null, false, { message: 'Incorrect Username' });
        else
        user.comparePassword(password, function (err, isMatch) {
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Incorrect Password' });
          }
        });
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
