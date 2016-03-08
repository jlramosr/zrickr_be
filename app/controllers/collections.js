var model = require('../models/collections');

var errorConfig = require('../config/error');
var logger   = require("../config/logger");

var express   = require('express');


var controller = {

  getCollections: function (req, res, next) {
    var id    = req.params.id;
    var user  = req.user;

    //All User Collections
    if (id === undefined) {
      model.collectionsModel.findByUser(user, function(err, collections) {
    		if (err) return errorConfig.manageError(res, err, 500, err.name, err.name, err.message);
    		req.collections = collections;
        next();
    	});
    }
    //User Collection by id
    else {
      model.collectionsModel.findByUserAndId(user, id, function(err, collection) {
        if (err) return errorConfig.manageError(res, err, 500, err.name, err.name, err.message);
        if (!collection)  {
          var errorMessage = 'Collection ' + id + ' Not Found';
          return errorConfig.manageError( res, undefined, 404, errorMessage, 'Not Found', errorMessage);
        }
        req.collections = [collection];
        next();
      });
    }
  },

  get: function (req, res) {
    res.status(200).json(req.collections);
  },

  insert: function (req, res) {
    var body    = req.body;
    var user    = req.user;
    var fields  = body.fields;

    if (fields) numFields = fields.length;

    if (!numFields || numFields == 0) {
      var errorMessage = 'A collection should have at least one field';
      return errorConfig.manageError(res, undefined, 404, errorMessage , 'Collection Creation Error', errorMessage);
    }

    var collection = model.collectionsModel.generateCollection(body, user, fields);
    collection.save(function (err) {
      if (err) {
        if (err.name == 'ValidationError' || err.name == 'MongoError')
          return errorConfig.manageError(res, err, 404, err.name, err.name, err.message);
        return errorConfig.manageError(res, err, 500, err.name, err.name, err.message);
      }
      res.status(200).json(collection);
    });
  },

  delete: function(req, res) {
    var id    = req.params.id;
    var user  = req.user;

    //All User Collections
    if (!id) {
      model.collectionsModel.findByUser(user).remove(function(err, result) {
        if (err) return errorConfig.manageError(res, err, 500, err.name, err.name, err.message);
        res.status(200).json({numAffected: result.result.n});
      })
    }
    //User Collection by id
    else {
      model.collectionsModel.findByUserAndId(user, id).remove(function(err, result) {
        if (err) return errorConfig.manageError(res, err, 500, err.name, err.name, err.message);
        res.status(200).json({numAffected: result.result.n});
      })
    }
  }

}

module.exports = controller
