var mongooseConfig = require('../config/db');
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
            model.zrickersModel.findByUserAndCollectionAndId(user, collectionId, zrickrId, function(err, zrickr) {
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
var zrickrSchema = new mongooseConfig.db.Schema ({
  _collection: { type: String, required: true, ref: 'Collection', trim: true },
  slug: { type: String, trim: true },
  values : {}
}, {strict: false}, { shardKey: { slug: 1 }});

//Add createAt and updateAt fields to the Schemas
zrickrSchema.plugin(mongooseConfig.timestamps);



//Validations
zrickrSchema.path('values').validate(function (values, done) {
  var user = {id: this._user};
  var collectionId = this._collection;
  modelC.collectionsModel.findByUserAndId(user, collectionId, function(err, collection) {
    if (err) done(err);
    if (!collection) done(false, "Collection " + collectionId + 'not exists')
    //Check if required fields are filled
    var requiredFields = collection.getNameFields("required");
    var messageCheckR = checkRequiredFields(requiredFields, values);
    if (messageCheckR) done(false, messageCheckR);
    //Check if all values of the zrickr have the correct type indicated in the collection
    var fieldsWithType = _.map(collection._fields, _.partialRight(_.pick, ['name','type']));
    var messageCheckT = checkFieldTypes(fieldsWithType, values);
    if (messageCheckT) done(false, messageCheckT);

    var promiseUniqueFields = model.zrickersModel.findByUserAndCollection(user, collectionId, function(err, zrickers) {
      if (err) done(err);
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
          done(false, err);
        }
      );
    })
  })
});



//Serials
zrickrSchema.pre('save', function(next) {
  var zrickr = this;
  var user = {id: this._user};
  var values = this.values;

  //Trim all values
  _.forIn(values, function(value, key) {
    if (value) values[key] = app.toTrim(value);
  });


  modelC.collectionsModel.findByUserAndId(user, this._collection, function(err, collection) {
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
}

zrickrSchema.statics.findByUser = function (user, cb) {
  return  this.find({}, cb)
              .populate({
                path: '_collection',
                match: { _user: { _id: user.id } },
                select: 'name _user',
                options: {}
              })
              .select('_id slug values');
}

zrickrSchema.statics.findByUserAndCollection = function (user, collectionId, cb) {
  return  this.find({}, cb)
              .populate({
                path: '_collection',
                match: { _id: collectionId, _user: { _id: user.id } },
                select: 'name _user',
                options: {}
              })
              .select('_id slug values');
}

zrickrSchema.statics.findByUserAndCollectionAndId = function (user, collectionId, id, cb) {
  return  this.findOne({ _id: id }, cb)
              .populate({
                path: '_collection',
                match: { _id: collectionId, _user: { _id: user.id } },
                select: 'name _user',
                options: {}
              })
              .select('_id slug values');
}



//Indexes



var model = {
  zrickersModel: mongooseConfig.db.model(nameZrickersModel, zrickrSchema),
};

module.exports = model;
