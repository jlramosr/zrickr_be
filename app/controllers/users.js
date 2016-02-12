var express = require('express');

var model = require('../models/users');

var LocalStrategy  = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var configAuth  = require('../config/auth');



var controller = {
  configure: function (passport) {

    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
      model.findById(id, function(err, user) {
        done(err, user);
      });
    });

    passport.use('local-signup', new LocalStrategy({
      // by default, local strategy uses username and password, we will override with email
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
      // asynchronous
      // User.findOne wont fire unless data is sent back
      process.nextTick(function() {
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
          // if there are any errors, return the error
          if (err) {
            return done(err);
          }
          // check to see if theres already a user with that email
          if (user) {
            return done(null, false, console.log('signupMessage', 'That email is already taken.'));
          }
          else {
            // if there is no user with that email
            // create the user
            var user = model.generateLocalUser({email: email, password: password});
            // save the user
            user.save(function(err) {
              if (err) throw err;
              return done(null, user);
            });
          }
        });
      });
    }));
  },




  findUsers: function (req, res) {
    res.send('users');
  },

  createUser: function(req, res) {
    passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    });
    console.log(req);
  },

  login: function (req, res) {
    res.send('users/login');
  },

  profile: function(req, res) {
    if (req.isAuthenticated()) {
      res.send(req.user);
    }
    else {
      res.redirect('/');
    }
  },

  logout: function(req, res) {
      req.logout();
      res.redirect('/');
  }
};


module.exports = controller;
