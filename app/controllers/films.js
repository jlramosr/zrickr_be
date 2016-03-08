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
      model.findByUser(idUser, function(err, films) {
    		if (err) return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
        logger.info("%d films founded", films.length);
    		res.status(200).json(films);
    	});
    }
    //User Film by id
    else {
      model.findByUserAndId(idUser, id, function(err, film) {
        if (!film) return errorConfig.manageError(res, err, 404, 'Film not Found', 'Not Found');
        if (err) return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
        logger.info("Film " + film.slug + " founded");
        res.status(200).json(film);
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
      res.status(200).json(film);
    });
  },

  update: function(req, res) {
    var id = req.params.id;
    var idUser = req.user.id;
    //All User Films
    if (!id) {
      var jsonCondition = {user: idUser}
        , jsonUpdate = req.body
        , options = { multi: true };
      model.update(jsonCondition, jsonUpdate, options, function(err, numAffected) {
        if (err) return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
        logger.info("%d films updated successfully", numAffected.nModified);
        res.status(200).json( { numAffected: numAffected.nModified });
      });
    }
    //User Film by id
    else {
      model.findByUserAndId(idUser, id, function(err, film) {
        if (!film) return errorConfig.manageError(res, err, 404, 'Film not Found', 'Not Found');
        if (err) return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
        film.updateFilm(req.body);
        film.save(function(err) {
          if (err) {
            if (err.name == 'ValidationError') return errorConfig.manageError(res, err, 400, err.name, err.name);
            return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
          }
          logger.info("Film " + film.slug + " updated successfully");
          res.status(200).json(film);
        });
      });
    }
  },

  delete: function(req, res) {
    var id = req.params.id;
    var idUser = req.user.id;
    //All User Films
    if (!id) {
      var jsonCondition = {user: idUser};
      var promise = model.count(jsonCondition, function (err,count) {
        return count;
      });
      promise.then(function (numFilms) {
        model.find(jsonCondition).remove(function(err) {
          if (err) return errorConfig.manageError(res, err, 'Internal Error', 'Server Error');
          logger.info("%d films removed successfully", numFilms);
          res.status(200).json( {numAffected: numFilms} );
        })
      });
    }
    //User Film by id
    else {
      model.findByUserAndId(idUser, id, function(err, film) {
        if (!film) return errorConfig.manageError(res, err, 404, 'Film not Found', 'Not Found');
        film.remove(function(err, film) {
          if (err) return errorConfig.manageError(res, err, 'Internal Error', 'Server Error');
          logger.info("Film " + film.slug + " removed successfully");
          res.status(200).json(film);
        })
      });
    }
  }
}

module.exports = controller;
