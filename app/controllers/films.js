var express     = require('express'),
    router      = express.Router(),
    path        = require('path'),
    path_models = '../models',
    model       = require(path.join(__dirname, path_models, 'films'));

var _getFilmsJSON = function(res, filter) {
  model.findFilms(filter).then(function(films) {
    res.json(films);
  }).catch(function(err) {
    res.json(err);
  });
}

var _insertFilm = function(information) {
  model.insertFilm(information);
}

var _updateFilm = function(filter, information) {
  model.updateFilm(filter, information);
}

var _deleteFilm = function(information) {
  model.deleteFilm(information);
}

var controller = {
  select: function (req, res, next) {
    var filter = {};
    var title = req.params.title;
    if (title !== undefined) {
      filter = {
        title: title
      };
    }
    _getFilmsJSON(res, filter);
  },

  insert: function (req, res, next) {
    console.log(req.params);
    var information = req.body;
    if (information) {
      _insertFilm(information);
    }
    _getFilmsJSON(res, information);
  },

  update: function(req, res, next) {
    var filter = {};
    var title = req.params.title;
    if (title !== undefined) {
      filter = {
        title: title
      };
    }
    var information = req.body;
    if (information) {
      _updateFilm(filter, information);
    }
    _getFilmsJSON(res, information);
  },

  delete: function(req, res, next) {
    var information = req.body;
    if (information) {
      _deleteFilm(information);
    }
    _getFilmsJSON(res);
  }
}

module.exports = controller;
