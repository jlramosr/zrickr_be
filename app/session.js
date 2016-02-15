var express = require('express');

var passportConfig = require('./config/passport');
var authConfig = require('./config/auth');

var expressSession = require('express-session');

var session = function(app, passport) {
  app.use(expressSession({
    secret: authConfig.secret,
    /*name: cookie_name,
    store: sessionStore, // connect-mongo session store*/
    proxy: true,
    resave: true,
    saveUninitialized: true}));
  app.use(passport.initialize());
  app.use(passport.session());
  passportConfig(passport);
}

module.exports = session;
