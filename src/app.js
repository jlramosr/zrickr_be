'use strict';

var express = require('express');

//Application
var app = express();

//Routes
app.get('/', function(req, res) {
  res.send("<h1>I love Zrickr!</h1>");
});

app.get('/peliculas', function(req, res) {
  res.send("<h1>Peliculas</h1>");
})

//Port
app.listen(3000, function() {
  console.log("The frontend server is running on port 3000!")
});
