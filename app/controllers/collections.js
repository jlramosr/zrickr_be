var model = require('../models/collections');
var modelZ = require('../models/zrickers');

var errors = require('../config/error');
var logger = require("../config/logger");

var express = require('express');


var controller = {

  getCollections: function (req, res, next) {
    var id    = req.params.id;
    var user  = req.user;

    //All User Collections
    if (id === undefined) {
      model.collectionsModel.findByUser(user, function(err, collections) {
    		if (err) return errors.json(res, err);
    		req.collections = collections;
        next();
    	});
    }
    //User Collection by id
    else {
      model.collectionsModel.findByUserAndId(user, id, function (err, collection) {
        if (err) return errors.json(res, err);
        if (!collection)
          return errors.json(res, new errors.Http404Error('Collection does not exist'));
        req.collections = [collection];
        next();
      });
    }
  },

  get: function (req, res) {
    if (!req.collections) return errors.json(res, new errors.Http404Error('Collections does not exist'));
    res.status(200).json(req.collections);
  },

  insert: function (req, res) {
    var body    = req.body;
    var user    = req.user;
    var fields  = body.fields;
    var numFields;

    if (fields) numFields = fields.length;

    if (!numFields || numFields == 0)
      return errors.json(res, new errors.Http400Error('A collection should have at least one field'));

    var collection = model.collectionsModel.generateCollection(body, user, fields);
    collection.save(function (err) {
      if (err) return errors.json(res, err);
      res.status(200).json(collection);
    });
  },

  delete: function(req, res) {
    var id    = req.params.id;
    var user  = req.user;

    //All User Collections
    if (!id) {
      modelZ.zrickersModel.findByUser(user).remove(function(err, result) {
        if (err) return errors.json(res, err);
        var numAffectedChildren = result.result.n;
        model.collectionsModel.findByUser(user).remove(function(err, result) {
          if (err) return errors.json(res, err);
          res.status(200).json({numAffected: result.result.n, numAffectedZrickers: numAffectedChildren});
        });
      })
    }
    //User Collection by id
    else {
      model.collectionsModel.findByUserAndId(user, id, function(err, collection) {
        if (err) return errors.json(res, err);
        var slugCollection = collection.slug;
        modelZ.zrickersModel.findByUserAndCollection(user, slugCollection).remove(function(err, result) {
          var numAffectedChildren = result.result.n;
          collection.remove(function(err, removedCollection) {
            if (err) return errors.json(res, err);
            res.status(200).json({numAffected: 1, numAffectedZrickers: numAffectedChildren});
          });
        });
      });
    }
  }

}

module.exports = controller
