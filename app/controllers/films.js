var model = require('../models/films');

var errorConfig = require('../config/error');
var logger   = require("../config/logger");

var express   = require('express');


var controller = {
  get: function (req, res) {
    var id = req.params.id;
    var idUser = req.user.id;
    //All User Films
    if (id === undefined) {
      return model.findByUser(idUser, function(err, films) {
    		if (err) return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
        logger.info("%d films founded", films.length);
    		return res.status(200).json(films);
    	});
    }
    //User Film by id
    else {
      return model.findByUserAndId(idUser, id, function(err, film) {
        if (!film) return errorConfig.manageError(res, err, 404, 'Film not Found', 'Not Found');
        if (err) return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
        logger.info("Film " + film.slug + " founded");
        return res.status(200).json(film);
      });
    }
  },

  insert: function (req, res) {
    var film = model.generateFilm(req.body, req.user);
    film.save(function (err) {
      if (err) {
        if (err.name == 'ValidationError') return errorConfig.manageError(res, err, 400, err.name, err.errors);
        return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
      }
      logger.info("Film " + film.slug + " created successfully");
      return res.status(200).json(film);
    });
  },

  update: function(req, res) {
    var id = req.params.id;
    var idUser = req.user.id;
    //All Films
    if (!id) {
      var jsonCondition = {user: idUser}
        , jsonUpdate = req.body
        , options = { multi: true };
      return model.update(jsonCondition, jsonUpdate, options, function(err, numAffected) {
        if (err) return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
        logger.info("%d films updated successfully", numAffected.nModified);
        return res.status(200).json( { numAffected: numAffected.nModified });
      });
    }
    //Film by id
    else {
      return model.findByUserAndId(idUser, id, function(err, film) {
        if (!film) return errorConfig.manageError(res, err, 404, 'Film not Found', 'Not Found');
        if (err) return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
        film.updateFilm(req.body);
        return film.save(function(err) {
          if (err) {
            if (err.name == 'ValidationError') return errorConfig.manageError(res, err, 400, err.name, err.name);
            return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
          }
          logger.info("Film " + film.slug + " updated successfully");
          return res.status(200).json(film);
        });
      });
    }
  },

  delete: function(req, res) {
    var id = req.params.id;
    var idUser = req.user.id;
    //All Films
    if (!id) {
      var jsonCondition = {user: idUser};
      var promise = model.count(jsonCondition, function (err,count) {
        return count;
      });
      promise.then(function (numFilms) {
        return model.remove(function(err) {
          if (err) return errorConfig.manageError(res, err, 'Internal Error', 'Server Error');
          logger.info("%d films removed successfully", numFilms);
          return res.status(200).json( {numAffected: numFilms} );
        })
      });
    }
    //Film by id
    else {
      return model.findByUserAndId(idUser, id, function(err, film) {
        if (!film) return errorConfig.manageError(res, err, 404, 'Film not Found', 'Not Found');
        return film.remove(function(err, film) {
          if (err) return errorConfig.manageError(res, err, 'Internal Error', 'Server Error');
          logger.info("Film " + film.slug + " removed successfully");
          return res.status(200).json(film);
        })
      });
    }
  }
}

module.exports = controller;
