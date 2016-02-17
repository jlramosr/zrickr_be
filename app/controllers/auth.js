var model = require('../models/users');

var authConfig = require('../config/auth');
var errorConfig = require('../config/error');

const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');

var express = require('express');

function _updateOrCreate(user, cb) {
  // db dummy, we just cb the user
  cb(null, user);
};

var controller = {

  authenticate: expressJwt({secret : authConfig.secret}),

  serialize: function (req, res, next) {

    _updateOrCreate(req.user, function(err, user) {
      if(err) return next(err);
      // we store the updated information in req.user again
      req.user = {
        id: user.id,
      };
      next();
    });
  },

  generateToken: function (req, res, next) {
    req.token = jwt.sign({
      id: req.user.id,
    }, authConfig.secret, {
      expiresIn: 120
    });
    next();
  },

  login: function(req, res) {
    res.status(200).json({
      user: req.user,
      token: req.token
    });
    /*
    var token = _getToken(req.headers);
    if (token) return errorConfig.manageError(res, undefined, 401, 'Login Error', 'User already Logged');
    var email = req.body.local.email;
    var password = req.body.local.password;
    if (!email || !password) return errorConfig.manageError(res, undefined, 401, 'Authentication Error', 'Email or Password not Provided');
    model.model.findOne( {'local.email': email}, function(err, user) {
      if (err) return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
      if (!user) return errorConfig.manageError(res, err, 401, 'Authentication Error', 'User not Found');
      user.comparePassword(password, function (err, isMatch) {
        if (isMatch && !err) {
          var infoUser = {_id: user._id, local: {email: user.local.email}, role: user.role};
          var token = jwt.encode(infoUser, authConfig.secret);
          console.log("User login done successfully");
          infoUser.token = 'JWT ' + token;
          return res.json(infoUser);
        }
        return errorConfig.manageError(res, err, 401, 'Authentication Error', 'Wrong Password', 'Wrong Password');
      });
    });*/
  },

  profile: function(req, res, next) {
    res.status(200).json(req.user);
    /*var id = req.params.id;
    var token = _getToken(req.headers);
    if (token) {
      var decoded = jwt.decode(token, authConfig.secret);
      model.model.findOne({'local.email': decoded.local.email}, function(err, user) {
        if (err) return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
        if (!user) return errorConfig.manageError(res, err, 403, 'Authentication Error', 'User not Found');
        console.log("Profile user founded successfully");
        return res.json(user.toSecureJSON());
      });
    }
    return errorConfig.manageError(res, err, 403, 'Authentication Error', 'No Token Provided');*/
  },

  logout: function(req, res, next) {
    console.log(req.user);
    delete req.user;
    return res.status(200).json({});
  },

};


module.exports = controller;
