'use strict';

var express = require('express'),
    routes = require('./routes'),
    views = require('./views'),
    app = express(),
    port = process.env.PORT || 3000;

routes(app);
views(app);

app.listen(port, function() {
  console.log("The frontend server is running on port 3000!")
});
