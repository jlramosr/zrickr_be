var express = require('express');

var passportConfig = require('./config/passport');
var authConfig = require('./config/auth');

var expressSession = require('express-session');

var session = function(app, passport) {
  app.use(expressSession({
    secret: authConfig.secret,
    cookie: { maxAge: 2628000000, secure: true },
    proxy: true,
    resave: true,
    saveUninitialized: true
  }));

  if (app.get('env') === 'production') {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
  }

  app.use(passport.initialize());
  app.use(passport.session());
  passportConfig(passport);
}

module.exports = session;
