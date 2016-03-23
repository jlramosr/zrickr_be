var model = require('../models/collections');
var modelZ = require('../models/zrickers');

var errors = require('../config/error');
var logger = require("../config/logger");

var express = require('express');


var controller = {

  get: function (req, res, next) {
    var id    = req.params.id;
    var user  = req.user;

    //All User Collections
    if (id === undefined) {
      model.collectionsModel.findCollections(user, function(err, collections) {
    		if (err) return errors.json(res, err);
    		res.status(200).json(collections);
    	});
    }
    //User Collection by id
    else {
      model.collectionsModel.findCollection(user, id, function (err, collection) {
        if (err) return errors.json(res, err);
        if (!collection)
          return errors.json(res, new errors.Http404Error('Collection ' + id + ' does not exist'));
        res.status(200).json(collection);
      });
    }
  },

  getPublic: function (req, res, next) {
    var id    = req.params.id;

    //All Public Schema Collections
    if (id === undefined) {
      model.collectionsModel.findPublicSchemas(function(err, collections) {
        if (err) return errors.json(res, err);
        res.status(200).json(collections);
      });
    }
    //Public Schema Collection by id
    else {
      model.collectionsModel.findPublicSchema(id, function (err, collection) {
        if (err) return errors.json(res, err);
        if (!collection)
          return errors.json(res, new errors.Http404Error('Public collection schema ' + id + ' does not exist'));
        res.status(200).json(collection);
      });
    }
  },

  getShared: function (req, res, next) {
    var id    = req.params.id;
    var user  = req.user;

    //All Shared Collections with the user
    if (id === undefined) {
      model.collectionsModel.findSharedCollections(user, function(err, collections) {
        if (err) return errors.json(res, err);
        res.status(200).json(collections);
      });
    }
    //Shared Collection by id
    else {
      model.collectionsModel.findSharedCollection(user, id, function (err, collection) {
        if (err) return errors.json(res, err);
        if (!collection)
          return errors.json(res, new errors.Http404Error('Shared collection ' + id + ' does not exist'));
        res.status(200).json(collection);
      });
    }
  },

  insert: function (req, res) {
    var body  = req.body;
    var user  = req.user;
    var id    = req.params.id;

    //Customized Collection
    if (id === undefined) {
      var collection = model.collectionsModel.generateCollection(body, user);
      collection.save(function (err) {
        if (err) return errors.json(res, err);
        res.status(200).json(collection);
      });
    }
    //From another public collection schema
    else {
      model.collectionsModel.findPublicSchema(id, function (err, collection) {
        if (err) return errors.json(res, err);
        if (!collection)
          return errors.json(res, new errors.Http404Error('Public collection schema ' + id + ' does not exist'));
        collection.name = body.name;
        collection._sharedWith = body._sharedWith || [];
        collection.publicSchema = false;
        var newCollection = model.collectionsModel.generateCollection(collection, user);
        newCollection.save(function (err) {
          if (err) return errors.json(res, err);
          res.status(200).json(newCollection);
        });
      });
    }
  },

  delete: function(req, res) {
    var id    = req.params.id;
    var user  = req.user;

    //All User Collections
    if (!id) {
      modelZ.zrickersModel.findZrickers(user).remove(function(err, result) {
        if (err) return errors.json(res, err);
        var numAffectedChildren = result.result.n;
        model.collectionsModel.findCollections(user).remove(function(err, result) {
          if (err) return errors.json(res, err);
          res.status(200).json({numAffected: result.result.n, numAffectedZrickers: numAffectedChildren});
        });
      })
    }
    //User Collection by id
    else {
      model.collectionsModel.findCollection(user, id, function(err, collection) {
        if (err) return errors.json(res, err);
        var collectionId = collection._id;
        modelZ.zrickersModel.findZrickersCollection(user, collectionId).remove(function(err, result) {
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
