'use strict';

var express = require('express'),
    path = require('path'),
    app = express(),
    index_controller = require(path.join(__dirname, 'controllers', 'index')),
    films_controller = require(path.join(__dirname, 'controllers', 'films'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use('/', index_controller);
app.use('/films', films_controller);

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

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("The frontend server is running on port 3000!")
});

module.exports = app;
