'use strict';

var express = require('express'),
    path = require('path'),
    app = express(),
    routes = require(path.join(__dirname, 'routes', 'index')),
    films = require(path.join(__dirname, 'routes', 'films'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use('/', routes);
app.use('/films', films);
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.listen(3000, function() {
  console.log("The frontend server is running on port 3000!")
});

module.exports = app;
