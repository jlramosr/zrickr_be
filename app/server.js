var express  = require('express');

var logger   = require("./config/logger");
var passport = require('passport');

var session  = require('./session');
var routes   = require('./routes');
var views    = require('./views');

var app = express();

var port = process.env.PORT || 3000;
app.use(require('morgan')("combined", { "stream": logger.stream }));

session(app, passport);
routes(app, passport);
views(app);

app.listen(port, function() {
  logger.debug("The frontend server is running on port " + port)
});
