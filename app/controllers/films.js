var model = require('../models/films');

var errorConfig = require('../config/error');

var express   = require('express');


var controller = {
  get: function (req, res) {
    var id = req.params.id;
    //All Films
    if (id === undefined) {
      return model.find(function(err, films) {
    		if (!err) {
          console.log("%d films founded", films.length);
    			return res.json(films);
    		}
        return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
    	});
    }
    //Film by id
    else {
      return model.findById(id, function(err, film) {
        if (!film) return errorConfig.manageError(res, err, 404, 'Film not Found', 'Not Found');
        if (!err) {
          console.log("Film " + film.slug + " founded");
          return res.json(film);
        }
        return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
      });
    }
  },

  insert: function (req, res) {
    try {
      var film = model.generateFilm(req.body, req.user);
    }
    catch (err) { return errorConfig.manageError(res, err, 422, 'Syntax Error', 'Syntax Error'); }

    film.save(function (err) {
      if (!err) {
        console.log("Film " + film.slug + " created successfully");
        return res.json(film);
      }
      else {
        if (err.name == 'ValidationError') return errorConfig.manageError(res, err, 400, 'Validation Error', 'Validation Error');
        return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
      }
    });
  },

  update: function(req, res) {
    var id = req.params.id;
    //All Films
    if (!id) {
      var jsonCondition = {}
        , jsonUpdate = req.body
        , options = { multi: true };
      return model.update(jsonCondition, jsonUpdate, options, function(err, numAffected) {
        if (!err) {
          console.log("%d films updated successfully", numAffected.nModified);
          return res.json( { numAffected: numAffected.nModified });
        }
        return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
      });
    }
    //Film by id
    else {
      return model.findById(id, function(err, film) {
        if(!film) return errorConfig.manageError(res, err, 404, 'Film not Found', 'Not Found');
        if(!err) {
          try {
            film.updateFilm(req.body);
          }
          catch (err) { return errorConfig.manageError(res, err, 422, 'Syntax Error', 'Syntax Error'); }
          return film.save(function(err) {
            if(!err) {
                console.log("Film " + film.slug + " updated successfully");
                return res.json(film);
            }
            else {
              if (err.name == 'ValidationError') return errorConfig.manageError(res, err, 400, 'Validation Error', 'Validation Error');
              return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
            }
          });
        }
      });
    }
  },

  delete: function(req, res) {
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
            console.log("%d films removed successfully", numFilms);
            return res.json( {numAffected: numFilms} );
          }
          return errorConfig.manageError(res, err, 'Internal Error', 'Server Error');
        })
      });
    }
    //Film by id
    else {
      return model.findById(id, function(err, film) {
        if (!film) return errorConfig.manageError(res, err, 404, 'Film not Found', 'Not Found');
        return film.remove(function(err, film) {
          if(!err) {
            console.log("Film " + film.slug + " removed successfully");
            return res.json(film);
          }
          return errorConfig.manageError(res, err, 'Internal Error', 'Server Error');
        })
      });
    }
  }
}

module.exports = controller;
