var mongooseConfig = require('../config/db');

var modelC = require('../models/collections');

var nameZrickersModel = 'Zricker';

var _ = require("lodash");


//Generic Functions
var checkRequiredFields = function(requiredFields, values) {
  var message;
  _.forOwn(requiredFields, function(key) {
    if (!values[key]) message = requiredFields + ' is required';
  });
  return message;
}

var checkUniqueFields = function(uniques, values, zrickers) {
  var message;
  if (uniques.length && zrickers.length) {
    var valuesUniquesThis = {};
    _.forOwn(uniques, function(key) {
      if (values[key]) valuesUniquesThis[key] = values[key].trim();
      //else valuesUniquesThis[key] = "";
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
    var messageCheck = checkRequiredFields(requiredFields, values);
    if (messageCheck) done(false, messageCheck);

    var promiseUniqueFields = model.zrickersModel.findByUserAndCollection(user, collection.slug, function(err, zrickers) {
      if (err) done(err);
    });

    promiseUniqueFields.then(function(zrickers) {
      //Check if unique fields are unique
      var uniqueFields = collection.getNameFields("unique");
      var messageCheck = checkUniqueFields(uniqueFields, values, zrickers);
      if (messageCheck) done(false, messageCheck);

      done(true);
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
    if (value) values[key] = value.trim();
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
