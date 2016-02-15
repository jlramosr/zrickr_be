var express = require('express');

var passport = require('passport');

var session  = require('./session');
var routes   = require('./routes');
var views    = require('./views');

var app = express();

var port = process.env.PORT || 3000;

session(app, passport);
routes(app, passport);
views(app);

app.listen(port, function() {
  console.log("The frontend server is running on port 3000!")
});
