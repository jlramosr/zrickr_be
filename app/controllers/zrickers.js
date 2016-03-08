var model = require('../models/zrickers');
var modelC = require('../models/collections');

var errorConfig = require('../config/error');
var logger = require("../config/logger");

var express = require('express');


var controller = {

  get: function (req, res) {
    var slugCollection  = req.params.slugCollection;
    var zrickrId        = req.params.zrickrId;
    var collections     = req.collections;
    var user            = req.user;

    //All User Zrickers
    if (slugCollection === undefined && zrickrId  === undefined) {
      model.zrickersModel.findByUser(user, function(err, zrickers) {
    		if (err) return errorConfig.manageError(res, err, 500, err.name, err.name, err.message);
    		res.status(200).json(zrickers);
    	});
    }
    else {
      if (!modelC.collectionExists(collections, slugCollection)) {
        var errorMessage = 'User Collection ' + slugCollection + ' Not Found';
        return errorConfig.manageError( res, undefined, 404, errorMessage, 'Not Found', errorMessage);
      }
      //User Zrickers by collection
      if (zrickrId === undefined) {
        model.zrickersModel.findByUserAndCollection(user, slugCollection, function(err, zrickers) {
          if (err) return errorConfig.manageError(res, err, 500, err.name, err.name, err.message);
          res.status(200).json(zrickers);
        });
      }
      //User Zricker identified by id and Collection
      else {
        model.zrickersModel.findByUserAndCollectionAndId(user, slugCollection, zrickrId, function(err, zrickr) {
          if (err) return errorConfig.manageError(res, err, 500, err.name, err.name, err.message);
          if (!zrickr) {
            var errorMessage = 'Zrickr ' + zrickrId + ' Not Found';
            return errorConfig.manageError( res, undefined, 404, errorMessage, 'Not Found', errorMessage);
          }
          res.status(200).json(zrickr);
        });
      }
    }
  },

  insert: function (req, res) {
    var body            = req.body;
    var user            = req.user;
    var slugCollection  = body.collection;

    modelC.collectionsModel.findByUserAndSlug(user, slugCollection, function(err, collection) {
      if (err) return errorConfig.manageError(res, err, 500, err.name, err.name, err.message);
      if (!collection && slugCollection) {//there is no collection with the provided name
        var errorMessage = 'User Collection ' + slugCollection + ' Not Found';
        return errorConfig.manageError( res, undefined, 404, errorMessage, 'Not Found', errorMessage);
      }
      if (!collection) { //no collection name provided
        collection = modelC.collectionsModel.generateCollection({}, user, {});
      }
      var zrickr = model.zrickersModel.generateZrickr(body, user, collection);
      zrickr.save(function (err) {
        if (err) {
          if (err.name == 'ValidationError') {
            if (err.errors.values)
              return errorConfig.manageError(res, err, 404, err.name, err.name, err.errors.values.properties.message);
          }
          if (err.name == 'ValidationError' || err.name == 'MongoError')
            return errorConfig.manageError(res, err, 404, err.name, err.name, err.message);
          return errorConfig.manageError(res, err, 500, err.name, err.name, err.message);
        }
        res.status(200).json(zrickr);
      });
    });
  },

  delete: function(req, res) {
    var slugCollection  = req.params.slugCollection;
    var zrickrId        = req.params.zrickrId;
    var user            = req.user;
    var collections     = req.collections;

    //All User Zrickers
    if (slugCollection === undefined && zrickrId === undefined) {
      model.zrickersModel.findByUser(user).remove(function(err, result) {
        if (err) return errorConfig.manageError(res, err, 500, err.name, err.name, err.message);
        res.status(200).json({numAffected: result.result.n});
      })
    }
    else {
      if (!modelC.collectionExists(collections, slugCollection)) {
        var errorMessage = 'User Collection ' + slugCollection + ' Not Found';
        return errorConfig.manageError( res, undefined, 404, errorMessage, 'Not Found', errorMessage);
      }
      //User Zrickers by collection
      if (zrickrId === undefined) {
        model.zrickersModel.findByUserAndCollection(user, slugCollection).remove(function(err, result) {
          if (err) return errorConfig.manageError(res, err, 500, err.name, err.name, err.message);
          res.status(200).json({numAffected: result.result.n});
        })
      }
      //User Zricker identified by id and Collection
      else {
        model.zrickersModel.findByUserAndCollectionAndId(user, slugCollection, zrickrId).remove(function(err, result) {
          if (err) return errorConfig.manageError(res, err, 500, err.name, err.name, err.message);
          res.status(200).json({numAffected: result.result.n});
        })
      }
    }
  }

}


module.exports = controller
