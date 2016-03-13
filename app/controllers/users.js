var model = require('../models/users');

var errors = require('../config/error');
var logger = require("../config/logger");

var _ = require('lodash');
var express = require('express');


var controller = {

  get: function (req, res, next) {
    var id = req.params.id;
    //All Users
    if (id === undefined) {
      return model.model.findSecureLocalUser(function(err, users) {
        if (err) return errors.json(res, err);
        return res.status(200).json(users);
      });
    }
    //User by id
    else {
      return model.model.findSecureLocalUserById(id, function(err, user) {
        if (err) return errors.json(res, err);
        if (!user)
          return errors.json(res, new errors.Http403Error('User does not exist'));
        return res.status(200).json(user);
      });
    }
  },

  create: function(req, res) {
    if (!_.has(req.body, 'local', 'local.email', 'local.password'))
      return errors.json(res, new errors.Http403Error('Email or Password not Provided'));
    var user = model.model.generateLocalUser(req.body);
    user.save(function(err) {
      if (err) return errors.json(res, err);
      return res.status(200).json(user.toSecure());
    });
  },

  update: function(req, res) {
    var id = req.params.id;
    return model.model.findById(id, function(err, user) {
      if (err) return errors.json(res, err);
      if (!user) return errors.json(res, new errors.Http404Error('User does not exist'));
      user.updateLocalUser(req.body);
      return user.save(function(err) {
        if (err) return errors.json(res, err);
        return res.status(200).json(user.toSecure());
      });
    });
  },

  delete: function(req, res) {
    var id = req.params.id;
    return model.model.findById(id, function(err, user) {
      if (err) return errors.json(res, err);
      if (!user) return errors.json(res, new errors.Http404Error('User does not exist'));
      return user.remove(function(err, film) {
        if (err) return errors.json(res, err);
        res.status(200).json(user.toSecure());
      })
    });
  }
};


module.exports = controller;
