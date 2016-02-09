var express  = require('express'),
    router   = express.Router(),
    model    = require('../models/films');

var _findAllFilms = function(res, filter) {
  var promise = model.findFilms(filter);
  promise.on('error', function(err) {
    console.log('Internal error(%d): %s', res.statusCode, err.message);
    res.statusCode = 500;
    return res.json({ error: 'Database error' });
  });
  promise.on('success', function(films) {
  });
  promise.on('complete', function(err, films) {
    res.json(films);
  });
}

var _getNumFilms = function(res, filter) {
  var promise = model.getNumFilms(filter);
  promise.on('error', function(err) {
    //res.json(err);
  });
  promise.on('success', function(count) {
    //res.json(count);
  });
  promise.on('complete', function(err, count) {
    res.json(count);
  });
}

var _insertFilm = function(res, information) {
  var promise = model.insertFilm(information);
  promise.on('error', function(err){
    //res.json(err);
  });
  promise.on('success', function(films) {
    //res.json(count);
  });
  promise.on('complete', function(err, films) {
    res.json(films);
  });
}

var _updateFilm = function(res, filter, information) {
  var promise = model.updateFilm(filter, information);
  promise.on('error', function(err) {
    //res.json(err);
  });
  promise.on('success', function(film) {
    //res.json(count);
  });
  promise.on('complete', function(err, film) {
    if (film === null) {
      res.json({});
    }
    else {
      res.json(film);
    }
  });
}

var _deleteFilm = function(res, information) {
  var promise = model.deleteFilm(information);
  promise.on('error', function(err) {
    res.json({});
  });
  promise.on('success', function(films) {
    //res.json(films);
  });
  promise.on('complete', function(err, count) {
    res.json(count);
  });
}

var controller = {
  count: function (req, res, next) {
    _getNumFilms(res);
  },
  select: function (req, res, next) {
    console.log("GET - /films");
  	return model.find(function(err, films) {
  		if (!err) {
  			return res.json(films);
  		}
      else {
        res.statusCode = 500;
  			console.log('Internal error(%d): %s', res.statusCode, err.message);
        return res.json({ error: 'Server error' });
  		}
  	});


    /*
    console.log("GET - /films");
    var filter = {};
    var title = req.params.title;
    if (title !== undefined && title) {
      filter = {
        title: title
      };
    }
    _findAllFilms(res, filter);
    */
  },

  insert: function (req, res, next) {
    var information = req.body;
    console.log(typeof information);
    if (information !== undefined && JSON.stringify(information) !== "{}") {
      _insertFilm(res, information);
    }
    else {
      res.send(JSON.parse("{}"));
    }
  },

  update: function(req, res, next) {
    var filter = {};
    var title = req.params.title;
    if (title !== undefined && title) {
      filter = {
        title: title
      };
    }
    var information = req.body;
    if (information === undefined || !information) {
      informacion = {};
    }
    _updateFilm(res, filter, information);
  },

  delete: function(req, res, next) {
    var information = req.body;
    if (information === undefined || !information) {
      informacion = {};
    }
    _deleteFilm(res, information);
  }
}

module.exports = controller;
