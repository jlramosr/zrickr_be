var mongoose = require('../config/db');
var app = require('../config/app');

var modelC = require('../models/collections');

var nameZrickersModel = 'Zricker';

var _ = require("lodash");


//Generic Functions
var checkRequiredFields = function(requiredFields, values) {
  var message;
  _.forOwn(requiredFields, function(key) {
    if ( _.isUndefined(values[key]) || values[key].length <= 0 )
      message = requiredFields + ' is required';
  });
  return message;
}

var checkUniqueFields = function(uniques, values, zrickers) {
  var message;
  if (uniques.length && zrickers.length) {
    var valuesUniquesThis = {};
    _.forOwn(uniques, function(key) {
      if (values[key]) valuesUniquesThis[key] = app.toTrim(values[key]);
    });
    var valuesUniquesAll = [];
    _.forIn(zrickers, function(value, key) {
      var valuesUniquesZrickr = _.pick(value.values, uniques);
      valuesUniquesAll.push(valuesUniquesZrickr);
    });
    if (_.find(valuesUniquesAll, valuesUniquesThis)) {
      message = uniques + ' must be unique';
    }
  }
  return message;
}

var checkFieldTypes = function(fieldsAndTypes, values) {
  var messages = [];
  _.forIn(fieldsAndTypes, function(value, key) {
    var errorTypeMessage;
    var property = value.name;
    var zrickrValue = _.get(values, property, undefined);
    if (!_.isUndefined(zrickrValue)) {
      var collectionType = value.type;
      var correctTypeAndNewValue = app.isCorrectType(collectionType, zrickrValue);
      if (!correctTypeAndNewValue.ok) {
        if (!_.isUndefined(correctTypeAndNewValue.message))
          messages.push(correctTypeAndNewValue.message + property);
        else if (app.startsWithVowel(collectionType))
          messages.push(property + ' must be an ' + collectionType);
        else
          messages.push(property + ' must be a ' + collectionType);
      }
      else values[property] = correctTypeAndNewValue.newValue;
    }
  });
  if (messages.length) return messages.join(', ');
  return;
}

var checkRelationalFields = function(collection, values, user) {
  var relationalFields = collection.getRelationalFields();
  var relationalPromises = [];
  _.forIn(relationalFields, function(fieldsType, type) {
    _.forEach(fieldsType, function(infoField) {
      var nameField = _.keys(infoField)[0];
      var arrayZrickersIds = values[nameField];
      if (!_.isUndefined(arrayZrickersIds)) {
        //for oneRelation transform value in array of one element
        if (!_.isArray(arrayZrickersIds)) arrayZrickersIds = [arrayZrickersIds];
        _.forEach(arrayZrickersIds, function(zrickrId) {
          var collectionId = _.values(infoField)[0];
          var promise = new Promise(function(resolve,reject) {
            if (zrickrId.length <= 0)
              resolve('Empty referenced zrickr of collection ' + collectionId + ' not found for field ' + nameField);
            model.zrickersModel.findZrickrCollection(user, collectionId, zrickrId, function(err, zrickr) {
              if (err || !zrickr) resolve('Referenced ' + zrickrId + ' zrickr of collection ' + collectionId + ' not found for field ' + nameField);
              resolve();
            });
          });
          relationalPromises.push(promise);
        });
      }
    })
  });
  return Promise.all(relationalPromises).then(
    function(messages) {
      var newMessages = _.pullAll(messages, [ undefined ]);
      if (newMessages.length) return newMessages.join(', ');
      return;
    }
  );
}



//Schemas
var zrickrSchema = new mongoose.db.Schema ({
  _collection: { type: String, required: true, ref: 'Collection', trim: true },
  slug: { type: String, trim: true },
  values : {}
}, {strict: false}, { shardKey: { slug: 1 }});

//Add createAt and updateAt fields to the Schemas
zrickrSchema.plugin(mongoose.timestamps);



//Validations
zrickrSchema.path('values').validate(function (values, done) {
  var collectionId = this._collection;
  modelC.collectionsModel.findById(collectionId, function(err, collection) {
    if (err) done(err);
    if (!collection) done(false, "Collection " + collectionId + ' does not exist')
    //Check if required fields are filled
    var requiredFields = collection.getNameFields("required");
    var messageCheckR = checkRequiredFields(requiredFields, values);
    if (messageCheckR) done(false, messageCheckR);
    //Check if all values of the zrickr have the correct type indicated in the collection
    var fieldsWithType = _.map(collection._fields, _.partialRight(_.pick, ['name','type']));
    var messageCheckT = checkFieldTypes(fieldsWithType, values);
    if (messageCheckT) done(false, messageCheckT);

    var user = {_id: collection._user};
    var promiseUniqueFields = model.zrickersModel.find({_collection: collectionId}, function(err, zrickers) {
      if (err) done(false, err.name);
      return zrickers;
    });
    promiseUniqueFields.then(function(zrickers) {
      //Check if unique fields are unique
      var uniqueFields = collection.getNameFields("unique");
      var messageCheckU = checkUniqueFields(uniqueFields, values, zrickers);
      if (messageCheckU) done(false, messageCheckU);
      //Check if relationals fields belongs to the indicated collection
      checkRelationalFields(collection, values, user).then(
        function (messageCheckR) {
          if (messageCheckR) done(false, messageCheckR);
          done();
        },
        function (err) {
          done(false, err.name);
        }
      );
    })
  })
});



//Serials
zrickrSchema.pre('save', function(next) {
  var zrickr = this;
  var values = this.values;

  //Trim all values
  _.forIn(values, function(value, key) {
    if (value) values[key] = app.toTrim(value);
  });


  modelC.collectionsModel.findById(this._collection, function(err, collection) {
    if (err) next(err);
    //Generate slug by referencing main fields of the collection
    var mainFields = collection.getNameFields("main");
    var slug = [];
    _.forOwn(mainFields, function(key) {
      if (zrickr.values[key]) slug.push(zrickr.values[key]);
    });
    zrickr.slug = slug.join();
    next();
  });
});



//Instance methods



//Statics
zrickrSchema.statics.generateZrickr = function (json, collection) {
  var zrickr = new this ({
    _collection: collection._id, // =json._collection
    values: {}
  });
  //Fill the values defined by the user in the collection
  _.forIn(collection._fields, function(value, key) {
    if (_.isUndefined(json[value.name]) && !_.isUndefined(value.byDefault))
      zrickr.values[value.name] = value.byDefault;
    else if (!_.isUndefined(json[value.name]))
      zrickr.values[value.name] = json[value.name];
  });
  return zrickr;
};

zrickrSchema.statics.findZrickers = function (user, cb) {
  this.find({})
      .populate({
        path: '_collection',
        match: { _user: user.id },
        select: 'name',
        options: {}
      })
      .select('slug values _collection')
      .exec(function(err, zrickers) {
        cb(err, _.filter(zrickers, function(o) {return o._collection != null}));
      });
};

zrickrSchema.statics.removeZrickers = function (user, cb) {
  this.find({})
      .populate({
        path: '_collection',
        match: { _user: user.id },
        select: '_id',
        options: {}
      })
      .select('_id _collection')
      .exec(function(err, zrickers) {
        if (err) cb(err);
        else {
          var filterZrickers = _.filter(zrickers, function(o) {return o._collection != null});
          var filterZrickersIds = _.map(filterZrickers, '_id');
          model.zrickersModel.remove({_id: {$in: filterZrickersIds}}, function (err, result) {
            cb(err, result);
          });
        }
      });
};

zrickrSchema.statics.findZrickersCollection = function (user, collectionId, cb) {
  if (mongoose.checkCorrectIds([collectionId], cb))
  this.find({_collection: mongoose.toObjectId(collectionId)})
      .populate({
        path: '_collection',
        match: {_user: user.id },
        select: 'name',
        options: {}
      })
      .select('slug values _collection')
      .exec(function(err, zrickers) {
        cb(err, _.filter(zrickers, function(o) {return o._collection != null}));
      });
};

zrickrSchema.statics.removeZrickersCollection = function (user, collectionId, cb) {
  if (mongoose.checkCorrectIds([collectionId], cb))
  this.find({_collection: mongoose.toObjectId(collectionId)})
      .populate({
        path: '_collection',
        match: {_user: user.id },
        select: '_id',
        options: {}
      })
      .select('_id _collection')
      .exec(function(err, zrickers) {
        if (err) cb(err);
        else {
          var filterZrickers = _.filter(zrickers, function(o) {return o._collection != null});
          var filterZrickersIds = _.map(filterZrickers, '_id');
          model.zrickersModel.remove({_id: {$in: filterZrickersIds}}, function (err, result) {
            cb(err, result);
          });
        }
      });
};

zrickrSchema.statics.findZrickrCollection = function (user, collectionId, id, cb) {
  if (mongoose.checkCorrectIds([id, collectionId], cb))
  this.findOne({_id: mongoose.toObjectId(id), _collection: mongoose.toObjectId(collectionId)})
      .populate({
        path: '_collection',
        match: { _user: user.id },
        select: 'name _collection',
        options: {}
      })
      .select('slug values _collection')
      .exec(function(err, zrickr) {
        if (err || !zrickr) cb(err, zrickr);
        else if (zrickr._collection === null) zrickr = null;
        else cb(err, zrickr);
      });
};

zrickrSchema.statics.removeZrickrCollection = function (user, collectionId, id, cb) {
  if (mongoose.checkCorrectIds([id, collectionId], cb))
  this.findOne({_id: mongoose.toObjectId(id), _collection: mongoose.toObjectId(collectionId)})
      .populate({
        path: '_collection',
        match: { _user: user.id },
        select: '_id',
        options: {}
      })
      .select('_id _collection')
      .exec(function(err, zrickr) {
        if (err || !zrickr) cb(err, zrickr);
        else model.zrickersModel.remove({_id: zrickr._id}, function (err, result) {
          if (err) cb(err);
          else cb(err, 1);
        });
      });
};

zrickrSchema.statics.findSharedZrickers = function (user, cb) {
  this.find({})
      .populate({
        path: '_collection',
        match: {_sharedWith: user.id},
        select: 'name _user',
        options: {}
      })
      .select('slug values _collection _user')
      .exec(function(err, zrickers) {
        cb(err, _.filter(zrickers, function(o) {return o._collection != null}));
      });
};

zrickrSchema.statics.findSharedZrickersCollection = function (user, collectionId, cb) {
  if (mongoose.checkCorrectIds([collectionId], cb))
  this.find({_collection: mongoose.toObjectId(collectionId)})
      .populate({
        path: '_collection',
        match: {_sharedWith: user.id},
        select: 'name',
        options: {}
      })
      .select('slug values _collection _user')
      .exec(function(err, zrickers) {
        cb(err, _.filter(zrickers, function(o) {return o._collection != null}));
      });
};

zrickrSchema.statics.findSharedZrickrCollection = function (user, collectionId, id, cb) {
  if (mongoose.checkCorrectIds([id, collectionId], cb))
  this.findOne({_id: mongoose.toObjectId(id), _collection: mongoose.toObjectId(collectionId)})
      .populate({
        path: '_collection',
        match: { _sharedWith: user.id },
        select: 'name _collection',
        options: {}
      })
      .select('slug values _collection _user')
      .exec(function(err, zrickr) {
        if (err || !zrickr) cb(err, zrickr);
        else if (zrickr._collection === null) zrickr = null;
        else cb(err, zrickr);
      });
};




//Indexes



var model = {
  zrickersModel: mongoose.db.model(nameZrickersModel, zrickrSchema),
};

module.exports = model;
