var model = require('../models/users');

var errorConfig = require('../config/error');
var logger   = require("../config/logger");

var express = require('express');


var controller = {

  get: function (req, res, next) {
    var id = req.params.id;
    //All Users
    if (id === undefined) {
      return model.model.findSecureLocalUser(function(err, users) {
        if (err) return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
        logger.info("%d users founded", users.length);
        return res.status(200).json(users);
      });
    }
    //User by id
    else {
      return model.model.findSecureLocalUserById(id, function(err, user) {
        if (!user) return errorConfig.manageError(res, err, 404, 'User not Found', 'Not Found');
        if (err) return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
        logger.info("User " + user.id + " founded");
        return res.status(200).json(user);
      });
    }
  },

  create: function(req, res) {
    if (!req.body.local)
      return errorConfig.manageError(res, undefined, 401, 'Validation Error', 'Email or Password not Provided', 'Email or Password not Provided');
    var email = req.body.local.email;
    var password = req.body.local.password;
    if (!email || !password) return errorConfig.manageError(res, undefined, 401, 'Validation Error', 'Email or Password not Provided', 'Email or Password not Provided');
    var user = model.model.generateLocalUser( {email: email, password: password} );
    user.save(function(err) {
      if (err) return errorConfig.manageError(res, err, 401, 'User Creation Error', 'User Creation Error');
      logger.info("User create successfully");
      return res.status(200).json(user.toSecure());
    });
  },

  update: function(req, res) {
    var id = req.params.id;
    return model.model.findById(id, function(err, user) {
      if(!user) return errorConfig.manageError(res, err, 404, 'User not Found', 'Not Found');
      if(!err) {
        user.updateLocalUser(req.body);
        return user.save(function(err) {
          if (err) {
            if (err.name == 'ValidationError') return errorConfig.manageError(res, err, 400, 'Validation Error', 'Validation Error');
            return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
          }
          logger.info("User " + user.id + " updated successfully");
          return res.status(200).json(user.toSecure());
        });
      }
    });
  },

  delete: function(req, res) {
    var id = req.params.id;
    return model.model.findById(id, function(err, user) {
      if (!user) return errorConfig.manageError(res, err, 404, 'User not Found', 'Not Found');
      return user.remove(function(err, film) {
        if (err) return errorConfig.manageError(res, err, 'Internal Error', 'Server Error');
        logger.info("User " + user.id + " removed successfully");
        res.status(200).json(user.toSecure());
      })
    });
  }
};


module.exports = controller;
