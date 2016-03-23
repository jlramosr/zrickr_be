var name_dbprod = 'zrickr';
var user_dbprod = 'mongo';
var pass_dbprod = '1234';
var name_dbtest = 'test';
var user_dbtest = 'mongo';
var pass_dbtest = '1234';
var env         = process.env.NODE_ENV || 'development';
var err         = false;

var errors = require('../config/error');
var logger   = require("../config/logger");

var _ = require("lodash");

var mongoose = {
  db:           require('mongoose'),
  timestamps:   require('mongoose-timestamp'),
  bcrypt:       require('bcrypt'),

  toObjectId: function(id) {
    return this.db.Types.ObjectId(id);
  },

  checkCorrectIds: function(ids, cb) {
    var db = this.db;
    if (_.findIndex(ids, function(id) {return !db.Types.ObjectId.isValid(id);}) >= 0) {
      cb (new errors.Http400Error('Some id argument passed is not a single String of 12 bytes or a string of 24 hex characters'));
      return false;
    }
    return true;
  }

}

var _startDB = function (namedb) {
  mongoose.db.connect('mongodb://localhost/' + namedb, function(err, res) {
    if(err) {
      logger.err('ERROR: connecting to Database. ' + err);
    } else {
      logger.debug('Connected to Database ' + namedb);
    }
  });
}

if ('development' == env || 'production' == env) {
  _startDB(name_dbprod);
}
else if ('test' == env) {
  _startDB(name_dbtest);
}
else {
  err = true;
}

if (err) {
  logger.error("There's no Environment to Connect Database");
}
else {
  logger.debug("I'm on " + env + " Environment");
}

module.exports = mongoose;
