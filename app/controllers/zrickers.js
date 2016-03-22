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
    var user            = req.user;

    //All User Zrickers
    if (collectionId === undefined && zrickrId  === undefined) {
      model.zrickersModel.findZrickersByUser(user, function(err, zrickers) {
    		if (err) return errors.json(res, err);
        res.status(200).json(zrickers);
    	});
    }
    else {
      //Check if collection exists
      modelC.collectionsModel.findCollectionByUserAndId(user, collectionId, function(err, collection) {
        if (err) return errors.json(res, err);
        if (!collection) return errors.json(res, new errors.Http404Error('Collection ' + collectionId + ' does not exist'));
        //User Zricker identified by collection
        if (zrickrId === undefined) {
          model.zrickersModel.findZrickersByUserAndCollection(user, collectionId, function(err, zrickers) {
            if (err) return errors.json(res, err);
            res.status(200).json(zrickers);
          });
        }
        //User Zricker identified by id and Collection
        else {
          model.zrickersModel.findZrickrByUserAndCollectionAndId(user, collectionId, zrickrId, function(err, zrickr) {
            if (err) return errors.json(res, err);
            if (!zrickr) return errors.json(res, new errors.Http404Error('Zrickr ' + zrickrId + ' does not exist'));
            res.status(200).json(zrickr);
          });
        }
      });
    }
  },

  insert: function (req, res) {
    var body            = req.body;
    var user            = req.user;
    var collectionId    = body._collection;

    if (collectionId === undefined)
      return errors.json(res, new errors.Http500Error('No collection provided'));
    modelC.collectionsModel.findCollectionByUserAndId(user, collectionId.trim(), function(err, collection) {
      if (err) return errors.json(res, err);
      if (!collection)
        return errors.json(res, new errors.Http404Error('Collection ' + collectionId.trim()  + ' does not exist'));
      var zrickr = model.zrickersModel.generateZrickr(body, collection);
      zrickr.save(function (err) {
        if (err) return errors.json(res, err);
        res.status(200).json(zrickr);
      });
    });
  },

  delete: function(req, res) {
    var collectionId    = req.params.collectionId;
    var zrickrId        = req.params.zrickrId;
    var user            = req.user;

    //All User Zrickers
    if (collectionId === undefined && zrickrId === undefined) {
      model.zrickersModel.removeZrickersByUser(user, function(err, result) {
        if (err) return errors.json(res, err);
        res.status(200).json({numAffected: result.result.n});
      });
    }
    else {
      //Check if collection exists
      modelC.collectionsModel.findCollectionByUserAndId(user, collectionId, function(err, collection) {
        if (err) return errors.json(res, err);
        if (!collection) return errors.json(res, new errors.Http404Error('Collection ' + collectionId + ' does not exist'));
        //User Zrickers by collection
        if (zrickrId === undefined) {
          model.zrickersModel.removeZrickersByUserAndCollection(user, collectionId, function(err, result) {
            if (err) return errors.json(res, err);
            res.status(200).json({numAffected: result.result.n});
          });
        }
        //User Zricker identified by id and Collection
        else
          model.zrickersModel.removeZrickrByUserAndCollectionAndId(user, collectionId, zrickrId, function(err, result) {
            if (err) return errors.json(res, err);
            if (!result) return errors.json(res, new errors.Http404Error('Zrickr ' + zrickrId + ' does not exist'));
            res.status(200).json({numAffected: result});
          })
      });
    }
  }

}


module.exports = controller
