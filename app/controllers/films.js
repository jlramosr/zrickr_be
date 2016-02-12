var express   = require('express');

var model = require('../models/films');

var _manageError = function (res, err, statusCode, messageConsole, messageJSON, summaryJSON) {
  res.statusCode = statusCode;
  var resJSON = { error: messageJSON };
  if (summaryJSON) {
    resJSON.summary = summaryJSON;
  }
  if (!err) {
    console.log('%s(%d): %s', messageConsole, res.statusCode, "");
  }
  else {
    if (!err.message) {
      console.log('%s(%d): %s', messageConsole, res.statusCode, "");
    }
    else {
      console.log('%s(%d): %s', messageConsole, res.statusCode, err.message);
    }
    if (err.errors && !summaryJSON) {
      resJSON.summary = err.errors;
    }
  }
  return res.json(resJSON);
}

var controller = {
  findFilms: function (req, res) {
    var id = req.params.id;
    //All Films
    if (id === undefined) {
      console.log("GET - /films");
      return model.find(function(err, films) {
    		if (!err) {
          console.log("Films founded!(%d)", res.statusCode);
    			return res.json(films);
    		}
        return _manageError(res, err, 500, 'Internal Error', 'Server Error');
    	});
    }
    //Film by id
    else {
      console.log("GET - /films/:id");
      return model.findById(id, function(err, film) {
        if (!film) return _manageError(res, err, 404, 'Film not found', 'Not found');
        if (!err) {
          console.log(film.slug);
          console.log("Film founded!(%d)", res.statusCode);
          return res.json(film);
        }
        return _manageError(res, err, 500, 'Internal Error', 'Server Error');
      });
    }
  },

  insertFilm: function (req, res) {
    console.log('POST - /films');
    try {
      var film = model.generateFilm(req.body);
    }
    catch (err) { return _manageError(res, err, 422, 'Syntax Error', 'Syntax Error'); }

    film.save(function (err) {
      if (!err) {
        console.log("Film created!(%d)", res.statusCode);
        return res.json(film);
      }
      else {
        if (err.name == 'ValidationError') return _manageError(res, err, 400, 'Internal Error', 'Validation Error');
        return _manageError(res, err, 500, 'Internal Error', 'Server Error');
      }
    });
  },

  updateFilm: function(req, res) {
    var id = req.params.id;
    //All Films
    if (!id) {
      console.log("PUT - /films");
      var jsonCondition = {}
        , jsonUpdate = req.body
        , options = { multi: true };
      return model.update(jsonCondition, jsonUpdate, options, function(err, numAffected) {
        if (!err) {
          console.log("Films updated!(%d)", res.statusCode);
          return res.json( { numAffected: numAffected.nModified });
        }
        return _manageError(res, err, 500, 'Internal Error', 'Server Error');
      });
    }
    //Film by id
    else {
      console.log("PUT - /films/:id");
      return model.findById(id, function(err, film) {
        if(!film) return _manageError(res, err, 404, 'Film not found', 'Not found');
        if(!err) {
          try {
            film.updateFilm(req.body);
          }
          catch (err) { return _manageError(res, err, 422, 'Syntax Error', 'Syntax Error'); }
          return film.save(function(err) {
            if(!err) {
                console.log("Film updated!(%d)", res.statusCode);
                return res.json(film);
            }
            else {
              if (err.name == 'ValidationError') return _manageError(res, err, 400, 'Internal error', 'Validation error');
              return _manageError(res, err, 500, 'Internal error', 'Server error');
            }
          });
        }
      });
    }
  },

  deleteFilms: function(req, res) {
    var id = req.params.id;
    //All Films
    if (!id) {
      var jsonCondition = {};
      var promise = model.count(jsonCondition, function (err,count) {
        return count;
      });
      promise.then(function (numFilms) {
        return model.remove(function(err) {
          if (!err) {
            console.log("Films removed!(%d)", res.statusCode);
            return res.json( {numAffected: numFilms} );
          }
          return _manageError(res, err, 'Internal error', 'Server error');
        })
      });
    }
    //Film by id
    else {
      console.log("DELETE - /films/:id");
      return model.findById(req.params.id, function(err, film) {
        if (!film) return _manageError(res, err, 404, 'Film not found', 'Not found');
        return film.remove(function(err, film) {
          if(!err) {
            console.log("Film removed!(%d)", res.statusCode);
            return res.json(film);
          }
          return _manageError(res, err, 'Internal error', 'Server error');
        })
      });
    }
  }
}

module.exports = controller;
