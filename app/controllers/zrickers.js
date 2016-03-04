var model = require('../models/zrickers');

var errorConfig = require('../config/error');
var logger   = require("../config/logger");

var express   = require('express');


var collectionController = {

  getCollections: function (req, res, next) {
    var id = req.params.id;
    var user = req.user;
    //All User Collections
    if (id === undefined) {
      model.collectionsModel.findByUser(user, function(err, collections) {
    		if (err) return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
        logger.info("%d collections founded", collections.length);
    		req.collections = collections;
        next();
    	});
    }
    //User Collection by id
    else {
      model.collectionsModel.findByUserAndId(user, id, function(err, collection) {
        if (!collection) return errorConfig.manageError(res, err, 404, 'Collection not Found', 'Not Found');
        if (err) return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
        logger.info("Collection " + collection.name + " founded");
        req.collections = [collection];
        next();
      });
    }
  },

  get: function (req, res) {
    res.status(200).json(req.collections);
  },

  insert: function (req, res) {
    var body = req.body;
    var user = req.user;
    var fields = body.fields;
    if (fields) numFields = fields.length;
    if (!numFields || numFields == 0)
      return errorConfig.manageError(res, undefined, 400, 'Collection Creation Error', 'Collection Creation Error', 'A collection should have at least one field');
    var collection = model.collectionsModel.generateCollection(body, user, fields);
    collection.save(function (err) {
      if (err) {
        if (err.name == 'ValidationError') return errorConfig.manageError(res, err, 400, err.name, err.errors);
        return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
      }
      logger.info("Collection " + collection.name + " created successfully");
      res.status(200).json(collection);
    });
  },

  delete: function(req, res) {
    var id = req.params.id;
    var user = req.user;
    //All User Collections
    if (!id) {
      var jsonCondition = {_user: user._id};
      var promise = model.collectionsModel.count(jsonCondition, function (err,count) {
        return count;
      });
      promise.then(function (numCollections) {
        model.collectionsModel.remove(function(err) {
          if (err) return errorConfig.manageError(res, err, 'Internal Error', 'Server Error');
          logger.info("%d collections removed successfully", numCollections);
          res.status(200).json( {numAffected: numCollections} );
        })
      });
    }
    //User Collection by id
    else {
      model.collectionsModel.findByUserAndId(user, id, function(err, collection) {
        if (!collection) return errorConfig.manageError(res, err, 404, 'Collection not Found', 'Not Found');
        collection.remove(function(err, collection) {
          if (err) return errorConfig.manageError(res, err, 'Internal Error', 'Server Error');
          logger.info("Collection " + collection.name + " removed successfully");
          res.status(200).json(collection);
        })
      });
    }
  }

}

var zrickrController = {

  get: function (req, res) {
    var nameCollection = req.params.nameCollection;
    var collections = req.collections;
    var user = req.user;
    //All User Zrickers
    if (nameCollection === undefined) {
      /*model.zrickersModel.findByUser(user, function(err, zrickers) {
    		if (err) return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
        logger.info("%d zrickers founded", zrickers.length);
    		res.status(200).json(zrickers);
    	});*/
      res.status(200).json("todo");
    }
    //User Zrickers by collection
    else {
      var collectionExists = false;
      for (var i=0; i < collections.length; i++) {
        if (collections[i].name == nameCollection) {
          collectionExists = true;
          break;
        }
      }
      if (!collectionExists)
        return errorConfig.manageError( res, undefined, 404,
                                        'User Collection ' + nameCollection + ' Not Found',
                                        'User Collection ' + nameCollection + ' Not Found');
      model.zrickersModel.findByCollection(nameCollection, function(err, zrickr) {
        if (err) return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
        logger.info("Zrickr " + zrickr._id + " founded");
        res.status(200).json(zrickr);
      });
    }
  },

  insert: function (req, res) {
    var body = req.body;
    var user = req.user;
    model.collectionsModel.findByUserAndName(user, body.collection, function(err, collection) {
      if (err) return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
      var collectionFields = [];
      var zrickr = model.zrickersModel.generateZrickr(body, collection);
      zrickr.save(function (err) {
        if (err) {
          if (err.name == 'ValidationError') return errorConfig.manageError(res, err, 400, err.name, err.errors);
          return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
        }
        logger.info("Zrickr " + zrickr._id + " created successfully");
        res.status(200).json(zrickr);
      });
    });
  },

  delete: function(req, res) {
    var id = req.params.id;
    var idUser = req.user.id;
    //All User Zrickers
    if (!id) {
      var jsonCondition = {_user: idUser};
      var promise = model.collectionsModel.count(jsonCondition, function (err,count) {
        return count;
      });
      promise.then(function (numCollections) {
        model.collectionsModel.remove(function(err) {
          if (err) return errorConfig.manageError(res, err, 'Internal Error', 'Server Error');
          logger.info("%d collections removed successfully", numCollections);
          res.status(200).json( {numAffected: numCollections} );
        })
      });
    }
    //User Zrickr by id
    else {
      model.collectionsModel.findByUserAndId(idUser, id, function(err, collection) {
        if (!collection) return errorConfig.manageError(res, err, 404, 'Collection not Found', 'Not Found');
        collection.remove(function(err, collection) {
          if (err) return errorConfig.manageError(res, err, 'Internal Error', 'Server Error');
          logger.info("Collection " + collection.name + " removed successfully");
          res.status(200).json(collection);
        })
      });
    }
  }

}


var controller = {
  collectionController: collectionController,
  zrickrController: zrickrController
}

module.exports = controller
