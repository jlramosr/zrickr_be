'use strict';

var express = require('express');

var routes   = require('./routes');
var views    = require('./views');

var app = express();

var passport = require('passport');
var expressSession = require('express-session');

var port = process.env.PORT || 3000;

app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());

routes(app,passport);
views(app);

app.listen(port, function() {
  console.log("The frontend server is running on port 3000!")
});
