var model = require('../models/zrickers');
var modelC = require('../models/collections');

var errors = require('../config/error');
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
    		if (err) return errors.json(res, err);
    		res.status(200).json(zrickers);
    	});
    }
    else {
      if (!modelC.collectionExists(collections, slugCollection))
        return errors.json(res, new errors.Http404Error('Collection does not exist'));
      //User Zrickers by collection
      if (zrickrId === undefined) {
        model.zrickersModel.findByUserAndCollection(user, slugCollection, function(err, zrickers) {
          if (err) return errors.json(res, err);
          res.status(200).json(zrickers);
        });
      }
      //User Zricker identified by id and Collection
      else {
        model.zrickersModel.findByUserAndCollectionAndId(user, slugCollection, zrickrId, function(err, zrickr) {
          if (err) return errors.json(res, err);
          res.status(200).json(zrickr);
        });
      }
    }
  },

  insert: function (req, res) {
    var body            = req.body;
    var user            = req.user;
    var slugCollection  = body.collection.trim();
    modelC.collectionsModel.findByUserAndSlug(user, slugCollection, function(err, collection) {
      if (err) return errors.json(res, err);
      if (!collection && slugCollection) //there is no collection with the provided name
        return errors.json(res, new errors.Http404Error('Collection does not exist'));
      if (!collection) //no collection name provided
        collection = modelC.collectionsModel.generateCollection({}, user, {});
      var zrickr = model.zrickersModel.generateZrickr(body, user, collection);
      zrickr.save(function (err) {
        if (err) return errors.json(res, err);
        res.status(200).json(zrickr);
      });
    });
  },

  delete: function(req, res) {
    var slugCollection  = req.params.slugCollection.trim();
    var zrickrId        = req.params.zrickrId;
    var user            = req.user;
    var collections     = req.collections;

    //All User Zrickers
    if (slugCollection === undefined && zrickrId === undefined) {
      model.zrickersModel.findByUser(user).remove(function(err, result) {
        if (err) return errors.json(res, err);
        res.status(200).json({numAffected: result.result.n});
      })
    }
    else {
      if (!modelC.collectionExists(collections, slugCollection))
        return errors.json(res, new errors.Http404Error('Collection does not exist'));
      //User Zrickers by collection
      if (zrickrId === undefined) {
        model.zrickersModel.findByUserAndCollection(user, slugCollection).remove(function(err, result) {
          if (err) return errors.json(res, err);
          res.status(200).json({numAffected: result.result.n});
        })
      }
      //User Zricker identified by id and Collection
      else {
        model.zrickersModel.findByUserAndCollectionAndId(user, slugCollection, zrickrId).remove(function(err, removeZrickr) {
          if (err) return errors.json(res, err);
          res.status(200).json({numAffected: 1});
        })
      }
    }
  }

}


module.exports = controller
