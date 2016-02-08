var express     = require('express'),
    router      = express.Router(),
    path        = require('path'),
    path_models = '../models',
    model       = require(path.join(__dirname, path_models, 'films'));

function _replacerJSON(data) {
  if (value === "" || value === null) {
    return undefined;
  }
    return value;
}

var _cleanJSON = function(param) {
  return JSON.stringify(param, _replacerJSON, 2);
}

var _getFilmsJSON = function(res, filter) {
  var promise = model.findFilms(filter);
  promise.on('error', function(err) {
    //res.json(err);});
  });
  promise.on('success', function(films) {
    //res.json(films);
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
    var filter = {};
    var title = req.params.title;
    if (title !== undefined && !title) {
      filter = {
        title: title
      };
    }
    _getFilmsJSON(res, filter);
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
