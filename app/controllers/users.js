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
  findUser: function (req, res, next) {
    var id = req.params.id;
    //All Users
    if (id === undefined) {
      return model.model.find(function(err, users) {
        if (!err) {
          console.log("Users founded successfully");
          return res.json(users);
        }
        return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
      });
    }
    //User by id
    else if (id !== "profile" && id !== "logout") {
      return model.model.findById(id, function(err, user) {
        if (!user) return errorConfig.manageError(res, err, 404, 'User not Found', 'Not Found');
        if (!err) {
          console.log("User founded!(%d)", res.statusCode);
          return res.json(user.toSecureJSON());
        }
        return errorConfig.manageError(res, err, 500, 'Internal Error', 'Server Error');
      });
    }
    // /users/profile
    else {
      next();
    }
  },

  createUser: function(req, res) {
    var email = req.body.local.email;
    var password = req.body.local.password;
    if (!email || !password)
      return errorConfig.manageError(res, undefined, 401, 'Validation Error', 'Email or Password not Provided', 'Email or Password not Provided');
    var user = model.model.generateLocalUser( {email: email, password: password} );
    user.save(function(err) {
      if (err) return errorConfig.manageError(res, err, 401, 'Username Exists', 'Username already Exists');
      console.log("User create successfully");
      return res.json(user.toSecureJSON());
    });
  },

  login: function(req, res) {
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
    });
  },

  profile: function(req, res, next) {
    var id = req.params.id;
    if (id === "profile") {
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
      else return errorConfig.manageError(res, err, 403, 'Authentication Error', 'No Token Provided');
    }
    else {
      next();
    }
  },

  logout: function(req, res, next) {
    req.session.destroy();
    return res.json({});
  },

  updateUser: function(req, res) {
    var id = req.params.id;
    //All Users
    if (!id) {
      var jsonCondition = {}
        , jsonUpdate = req.body
        , options = { multi: true };
      return model.model.update(jsonCondition, jsonUpdate, options, function(err, numAffected) {
        if (!err) {
          console.log("%d users updated successfully", numAffected.nModified);
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
                console.log("User " + user.id + " updated successfully");
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

  deleteUser: function(req, res) {
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
            console.log("%d users removed successfully", numUsers);
            return res.json( {numAffected: numUsers} );
          }
          return errorConfig.manageError(res, err, 'Internal Error', 'Server Error');
        })
      });
    }
    //Film by id
    else {
      return model.model.findById(id, function(err, user) {
        if (!user) return errorConfig.manageError(res, err, 404, 'User not Found', 'Not Found');
        return user.remove(function(err, film) {
          if(!err) {
            console.log("User " + user.id + " removed successfully");
            return res.json(user.toSecureJSON());
          }
          return errorConfig.manageError(res, err, 'Internal Error', 'Server Error');
        })
      });
    }
  }
};


module.exports = controller;
