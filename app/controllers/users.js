var model = require('../models/users');

var errorConfig = require('../config/error');
var logger   = require("../config/logger");

var express = require('express');


var controller = {

  get: function (req, res, next) {
    var id = req.params.id;
    //All Users
    if (id === undefined) {
      return model.model.find(function(err, users) {
        if (!err) {
          logger.info("Users founded successfully");
          return res.json(users);
        }
        return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
      });
    }
    //User by id
    else {
      return model.model.findById(id, function(err, user) {
        if (!user) return errorConfig.manageError(res, err, 404, 'User not Found', 'Not Found');
        if (!err) {
          logger.info("User founded!(%d)", res.statusCode);
          return res.json(user.toSecureJSON());
        }
        return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
      });
    }
  },

  create: function(req, res) {
    if (!req.body.local)
      return errorConfig.manageError(res, undefined, 401, 'Validation Error', 'Email or Password not Provided', 'Email or Password not Provided');
    var email = req.body.local.email;
    var password = req.body.local.password;
    var user = model.model.generateLocalUser( {email: email, password: password} );
    user.save(function(err) {
      if (!err) {
        logger.info("User create successfully");
        return res.json(user.toSecureJSON());
      }
      return errorConfig.manageError(res, err, 401, 'User Creation Error', 'User Creation Error');
    });
  },

  update: function(req, res) {
    var id = req.params.id;
    //All Users
    if (!id) {
      var jsonCondition = {}
        , jsonUpdate = req.body
        , options = { multi: true };
      return model.model.update(jsonCondition, jsonUpdate, options, function(err, numAffected) {
        if (!err) {
          logger.info("%d users updated successfully", numAffected.nModified);
          return res.json( { numAffected: numAffected.nModified });
        }
        return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
      });
    }
    //User by id
    else {
      return model.model.findById(id, function(err, user) {
        if(!user) return errorConfig.manageError(res, err, 404, 'User not Found', 'Not Found');
        if(!err) {
          try {
            user.updateLocalUser(req.body);
          }
          catch (err) { return errorConfig.manageError(res, err, 422, 'Syntax Error', 'Syntax Error'); }
          return user.save(function(err) {
            if(!err) {
                logger.info("User " + user.id + " updated successfully");
                return res.json(user.toSecureJSON());
            }
            else {
              if (err.name == 'ValidationError') return errorConfig.manageError(res, err, 400, 'Validation Error', 'Validation Error');
              return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
            }
          });
        }
      });
    }
  },

  delete: function(req, res) {
    var id = req.params.id;
    //All Users
    if (!id) {
      var jsonCondition = {};
      var promise = model.model.count(jsonCondition, function (err,count) {
        return count;
      });
      promise.then(function (numUsers) {
        return model.model.remove(function(err) {
          if (!err) {
            logger.info("%d users removed successfully", numUsers);
            return res.json( {numAffected: numUsers} );
          }
          return errorConfig.manageError(res, err, 'Internal Error', 'Server Error');
        })
      });
    }
    //User by id
    else {
      return model.model.findById(id, function(err, user) {
        if (!user) return errorConfig.manageError(res, err, 404, 'User not Found', 'Not Found');
        return user.remove(function(err, film) {
          if(!err) {
            logger.info("User " + user.id + " removed successfully");
            return res.json(user.toSecureJSON());
          }
          return errorConfig.manageError(res, err, 'Internal Error', 'Server Error');
        })
      });
    }
  }
};


module.exports = controller;
