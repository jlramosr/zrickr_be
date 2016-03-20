var model = require('../models/zrickers');
var modelC = require('../models/collections');

var errors = require('../config/error');
var logger = require("../config/logger");
var app = require("../config/app");

var express = require('express');


var controller = {

  get: function (req, res) {
    var collectionId    = req.params.collectionId;
    var zrickrId        = req.params.zrickrId;
    var collections     = req.collections;
    var user            = req.user;

    //All User Zrickers
    if (collectionId === undefined && zrickrId  === undefined) {
      model.zrickersModel.findByUser(user, function(err, zrickers) {
    		if (err) return errors.json(res, err);
    		res.status(200).json(zrickers);
    	});
    }
    else {
      if (!modelC.collectionExists(collections, collectionId))
        return errors.json(res, new errors.Http404Error('Collection does not exist'));
      //User Zrickers by collection
      if (zrickrId === undefined) {
        model.zrickersModel.findByUserAndCollection(user, collectionId, function(err, zrickers) {
          if (err) return errors.json(res, err);
          res.status(200).json(zrickers);
        });
      }
      //User Zricker identified by id and Collection
      else {
        model.zrickersModel.findByUserAndCollectionAndId(user, collectionId, zrickrId, function(err, zrickr) {
          if (err) return errors.json(res, err);
          if (!zrickr)
            return errors.json(res, new errors.Http404Error('Zrickr does not exist'));
          res.status(200).json(zrickr);
        });
      }
    }
  },

  insert: function (req, res) {
    var body            = req.body;
    var user            = req.user;
    var collectionId    = body._collection.trim();

    modelC.collectionsModel.findByUserAndId(user, collectionId, function(err, collection) {
      if (err) return errors.json(res, err);
      if (!collection && collectionId) //there is no collection id provided
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
    var collectionId    = req.params._collection.trim();
    var zrickrId        = req.params.zrickrId;
    var user            = req.user;
    var collections     = req.collections;

    //All User Zrickers
    if (collectionId === undefined && zrickrId === undefined) {
      model.zrickersModel.findByUser(user).remove(function(err, result) {
        if (err) return errors.json(res, err);
        res.status(200).json({numAffected: result.result.n});
      })
    }
    else {
      if (!modelC.collectionExists(collections, collectionId))
        return errors.json(res, new errors.Http404Error('Collection does not exist'));
      //User Zrickers by collection
      if (zrickrId === undefined) {
        model.zrickersModel.findByUserAndCollection(user, collectionId).remove(function(err, result) {
          if (err) return errors.json(res, err);
          res.status(200).json({numAffected: result.result.n});
        })
      }
      //User Zricker identified by id and Collection
      else
        model.zrickersModel.findByUserAndCollectionAndId(user, collectionId, zrickrId).remove(function(err, removeZrickr) {
          if (err) return errors.json(res, err);
          res.status(200).json({numAffected: 1});
        })
    }
  }

}


module.exports = controller
