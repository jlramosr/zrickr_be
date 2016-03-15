var mongooseConfig = require('../config/db');
var app = require('../config/app');

var modelC = require('../models/collections');

var nameZrickersModel = 'Zricker';

var _ = require("lodash");


//Generic Functions
var checkRequiredFields = function(requiredFields, values) {
  var message;
  _.forOwn(requiredFields, function(key) {
    if (_.isUndefined(values[key])) message = requiredFields + ' is required';
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
    var zrickrValue = _.get(values, property, false);
    if (!_.isUndefined(zrickrValue)) {
      var collectionType = value.type;
      var correctTypeAndNewValue = app.isCorrectType(collectionType, zrickrValue);
      if (!correctTypeAndNewValue.ok) {
        if (!_.isUndefined(correctTypeAndNewValue.message))
          messages.push(correctTypeAndNewValue.message);
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



//Schemas
var zrickrSchema = new mongooseConfig.db.Schema ({
  _collection: { type: String, required: true },
  _user: { type: String, required: true },
  slug: { type: String },
  values : {}
}, {strict: false});

//Add createAt and updateAt fields to the Schemas
zrickrSchema.plugin(mongooseConfig.timestamps);



//Validations
zrickrSchema.path('values').validate(function (values, done) {
  var user = {id: this._user};
  var promiseInfoCollection = modelC.collectionsModel.findByUserAndSlug(user, this._collection, function(err, collection) {
    if (err) done(err);
  });
  promiseInfoCollection.then(function(collection) {
    //Check if required fields are filled
    var requiredFields = collection.getNameFields("required");
    var messageCheckR = checkRequiredFields(requiredFields, values);
    if (messageCheckR) done(false, messageCheckR);
    //Check if all values of the zrickr have the correct type indicated in the collection
    var fieldsWithType = _.map(collection._fields, _.partialRight(_.pick, ['name','type']));
    var messageCheckT = checkFieldTypes(fieldsWithType, values);
    if (messageCheckT) done(false, messageCheckT);

    var promiseUniqueFields = model.zrickersModel.findByUserAndCollection(user, collection.slug, function(err, zrickers) {
      if (err) done(err);
    });
    promiseUniqueFields.then(function(zrickers) {
      //Check if unique fields are unique
      var uniqueFields = collection.getNameFields("unique");
      var messageCheckU = checkUniqueFields(uniqueFields, values, zrickers);
      if (messageCheckU) done(false, messageCheckU);

      done();

    })
  })
});



//Serials
zrickrSchema.pre('save', function(next) {
  var user = {id: this._user};
  var values = this.values;
  var zrickr = this;

  //Trim all values
  _.forIn(values, function(value, key) {
    if (value) values[key] = app.toTrim(value);
  });

  modelC.collectionsModel.findByUserAndSlug(user, this._collection, function(err, collection) {
    if (err) next(err);
    //Generate slug by referencing main fields of the collection
    var mainFields = collection.getNameFields("main");
    var slug = [];
    _.forOwn(mainFields, function(key) {
      if (values[key]) slug.push(zrickr.values[key]);
    });
    zrickr.slug = slug.join();
    next();
  });
});



//Instance methods



//Statics
zrickrSchema.statics.generateZrickr = function (json, user, collection) {
  var zrickr = new this ({
    _collection: collection.slug, // =json.collection
    _user: user.id,
    values: {}
  });
  _.forIn(collection._fields, function(value, key) {
    if (_.isUndefined(json[value.name]) && !_.isUndefined(value.byDefault))
      zrickr.values[value.name] = value.byDefault;
    else
      zrickr.values[value.name] = json[value.name];
  });
  return zrickr;
}

zrickrSchema.statics.findByUser = function (user, cb) {
  return this.find({ _user: user.id }, cb).select('-__v');
}

zrickrSchema.statics.findByUserAndCollection = function (user, slugCollection, cb) {
  return this.find({ _collection: slugCollection, _user: user.id}, cb).select('-__v -_collection -_user');
}

zrickrSchema.statics.findByUserAndCollectionAndId = function (user, slugCollection, id, cb) {
  return this.findOne({ _id: id, _collection: slugCollection, _user: user.id }, cb).select('-__v -_collection -_user -_id');
}



//Indexes



var model = {
  zrickersModel: mongooseConfig.db.model(nameZrickersModel, zrickrSchema),
};

module.exports = model;
