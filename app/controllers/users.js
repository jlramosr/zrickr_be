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
        if (err) return errorConfig.manageError(res, err, 500, err.name, err.name, err.message);
        if (!users) return errorConfig.manageError(res, undefined, 404, 'Users not Found', 'Not Found', 'Users not Found');
        return res.status(200).json(users);
      });
    }
    //User by id
    else {
      return model.model.findSecureLocalUserById(id, function(err, user) {
        if (err) return errorConfig.manageError(res, err, 500, err.name, err.name, err.message);
        if (!user) return errorConfig.manageError(res, undefined, 404, 'User not Found', 'Not Found', 'User not Found');
        return res.status(200).json(user);
      });
    }
  },

  create: function(req, res) {
    if (!req.body.local)
      return errorConfig.manageError(res, undefined, 401, 'Email or Password not Provided', 'Validation Error', 'Email or Password not Provided');
    var email = req.body.local.email;
    var password = req.body.local.password;
    if (!email || !password)
      return errorConfig.manageError(res, undefined, 401, 'Email or Password not Provided', 'Validation Error', 'Email or Password not Provided');
    var user = model.model.generateLocalUser( {email: email, password: password} );
    user.save(function(err) {
      if (err) return errorConfig.manageError(res, err, 500, 'User Creation Error', 'User Creation Error');
      return res.status(200).json(user.toSecure());
    });
  },

  update: function(req, res) {
    var id = req.params.id;
    return model.model.findById(id, function(err, user) {
      if (err) return errorConfig.manageError(res, err, 500, err.name, err.name, err.message);
      if (!user) return errorConfig.manageError(res, undefined, 404, 'User not Found', 'Not Found');
      user.updateLocalUser(req.body);
      return user.save(function(err) {
        if (err) {
          var lastKeyMessage = _.findLastKey(err.errors,'message');
          if (err.name == 'ValidationError' && err.errors && lastKeyMessage)
            return errorConfig.manageError(res, err, 404, err.name, err.name, err.errors[lastKeyMessage].message);
          if (err.name == 'ValidationError' || err.name == 'MongoError')
            return errorConfig.manageError(res, err, 404, err.name, err.name, err.message);
          return errorConfig.manageError(res, err, 500, err.name, err.name, err.message);
        }
        return res.status(200).json(user.toSecure());
      });
    });
  },

  delete: function(req, res) {
    var id = req.params.id;
    return model.model.findById(id, function(err, user) {
      if (err) return errorConfig.manageError(res, err, 500, err.name, err.name, err.message);
      if (!user)  {
        var errorMessage = 'User ' + id + ' Not Found';
        return errorConfig.manageError( res, undefined, 404, errorMessage, 'Not Found', errorMessage);
      }
      return user.remove(function(err, film) {
        if (err) return errorConfig.manageError(res, err, 500, err.name, err.name, err.message);
        res.status(200).json(user.toSecure());
      })
    });
  }
};


module.exports = controller;
