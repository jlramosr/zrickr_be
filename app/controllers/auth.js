var authConfig = require('../config/auth');
var errors = require('../config/error');
var logger = require("../config/logger");

const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');

var express = require('express');

function _updateOrCreate(user, cb) {
  // db dummy, we just cb the user
  cb(null, user);
};

var controller = {

  //To protect our api we use the module express-jwt. It checks, if an
  //incoming token (set in Authorization-Header) is valid and stores the
  //token data in req.user (jwt.decode(Authorization) => req.user)
  //http://jwt.io/
  authenticate: expressJwt(
    {secret : authConfig.secret},
    function(req,res) {
    }
  ),

  serialize: function (req, res, next) {

    _updateOrCreate(req.user, function(err, user) {
      if(err) return next(err);
      // we store the updated information in req.user again
      req.user = {
        id: user.id,
        admin: user.admin,
      };
      next();
    });
  },

  generateToken: function (req, res, next) {
    //Generate token with id and admin
    req.token = jwt.sign({
      id: req.user.id,
      admin: req.user.admin,
    }, authConfig.secret, {
      expiresIn: authConfig.sessionExpires
    });
    next();
  },

  login: function(req, res) {
    if (!req.token) return errors.json(res, new errors.Http401Error('Authentication Error'));
    res.status(200).json({
      token: req.token
    });
  },

  profile: function(req, res, next) {
    if (!req.user) return errors.json(res, new errors.Http404Error('User does not exist'));
    req.params.id = req.user.id;
    next();
  }

};


module.exports = controller;
