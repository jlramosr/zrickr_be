var model = require('../models/users');

var authConfig = require('../config/auth');
var errorConfig = require('../config/error');

var express = require('express');

var jwt = require('jwt-simple');

var _getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) return parted[1];
  }
  return null;
};


var controller = {
  findUsers: function (req, res, next) {
    var id = req.params.id;
    //All Users
    if (id === undefined) {
      console.log("GET - /users");
      return model.find(function(err, users) {
        if (!err) {
          console.log("Users founded!(%d)", res.statusCode);
          return res.json(users);
        }
        return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
      });
    }
    //User by id
    /*else if (id !== "profile") {
      console.log("GET - /users/:id");
      return model.findById(id, function(err, user) {
        if (!user) return errorConfig.manageError(res, err, 404, 'User not Found', 'Not Found');
        if (!err) {
          console.log("User founded!(%d)", res.statusCode);
          return res.json(user.toSecureJSON());
        }
        return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
      });
    }
    else {
      next();
    }*/
  },

  createUser: function(req, res) {
    console.log("POST - /users");
    var email = req.body.email;
    var password = req.body.password;
    if (!email || !password)
      return errorConfig.manageError(res, err, 401, 'Validation Error', 'Email or Password not Provided', 'Email or Password not Provided');
    var user = model.generateLocalUser( {email: email, password: password} );
    user.save(function(err) {
      if (err) return errorConfig.manageError(res, err, 401, 'Username Exists', 'Username already Exists');
      console.log("User created!(%d)", res.statusCode);
      res.json(user.toSecureJSON());
    });
  },

  login: function(req, res) {
    console.log("POST - /users/login");
    var email = req.body.email;
    var password = req.body.password;
    if (!email) return errorConfig.manageError(res, err, 401, 'Authentication Error', 'Email not Provided');
    model.findOne( {'local.email': email}, function(err, user) {
      if (err) return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
      if (!user) return errorConfig.manageError(res, err, 401, 'Authentication Error', 'User not Found');
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          var infoUser = {_id: user._id, email: user.local.email};
          var token = jwt.encode(user, authConfig.secret);
          console.log("User founded!(%d)", res.statusCode);
          infoUser.token = 'JWT ' + token;
          return res.json(infoUser);
        }
        return errorConfig.manageError(res, err, 401, 'Authentication Error', 'Wrong Password', 'Wrong Password');
      });
    });
  },

  profile: function(req, res) {
    console.log("GET /users/profile");
    var token = _getToken(req.headers);
    if (token) {
      var decoded = jwt.decode(token, authConfig.secret);
      model.findOne({'local.email': decoded.local.email}, function(err, user) {
        if (err) return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
        if (!user) return errorConfig.manageError(res, err, 403, 'Authentication Error', 'User not Found');
        res.json(user.toSecureJSON());
      });
    }
    else return errorConfig.manageError(res, err, 403, 'Authentication Error', 'No Token Provided');
  },
};


module.exports = controller;
