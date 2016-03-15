var mongooseConfig = require('../config/db');
var app = require('../config/app');

var nameCollectionsModel = 'Collection';
var nameFieldsModel = 'Field';

var _ = require("lodash");


//Generic Functions
var getSlug = function(name) {
  return mongooseConfig.slugify(name.toLowerCase());
};

var collectionExists = function(collections, slugCollection) {
  if (_.findIndex(collections, { 'slug': slugCollection }) < 0) return false;
  return true;
};

var checkOneMainField = function(fields) {
  var message;
  if (_.findIndex(fields, { 'main': true }) < 0)
    message = "It must be at least one main field";
  return message;
};

var checkByDefaults = function(fields) {
  var messages = [];
  _.forIn(fields, function(value, key) {
    if (!_.isUndefined(value.byDefault) && _.indexOf(app.fieldsTypes, value.type) >= 0) {
      var correctTypeAndNewValue = app.isCorrectType(value.type, value.byDefault, value.collection);
      if (!correctTypeAndNewValue.ok)
        messages.push(value.byDefault + ' byDefault for ' + value.name + ' is not of ' + value.type + ' type');
      else value.byDefault = correctTypeAndNewValue.newValue;
    }
  });
  if (messages.length) return messages.join(', ');
  return;
};

var checkRelationalPromise = function(field, user) {
  return new Promise(function(resolve, reject) {
    var collectionSlug = field._collection;
    if (_.isUndefined(collectionSlug)) {
      //There is no collection attribute
      resolve('Relational field ' + field.name + ' must have a referenced collection');
    }
    else {
      //There is a collection attribute
      if (typeof(collectionSlug) !== 'string') {
        //The provided collection is not a string
        resolve('Relational field ' + field.name + ' must have a valid collection');
      }
      else {
      //The provided collection does not exists or is not of the current user
        var promiseInfoCollection = model.collectionsModel.findByUserAndSlug(user, collectionSlug, function(err, collection) {
          if (err) done(err);
        });
        promiseInfoCollection.then(function(collection) {
          if (!collection)
            resolve('Referenced Collection ' + collectionSlug + ' Not Found');
          resolve();
        });
      }
    }
  });
};

var checkRelationals = function(fields, user, messages) {
  var messages = [];
  var numFields = fields.length;
  if (fields.length) {
    if (_.includes(app.getRelationalTypes(), fields[0].type)) {
      var relationalPromise = checkRelationalPromise(value, user);
      relationalPromise.then(function(message) {
        console.log('message',message);
        messages.push(message);
        checkRelationals(fields.remove(fields[0], user, messages);
      });
    }
    else {
      checkRelationals(fields.remove(fields[0], user, messages);
    }
  }
  else {
    if (messages.length) return messages.join(', ');
    return;
  }
}

//Schemas
var fieldSchema = new mongooseConfig.db.Schema ({
  name: { type: String, required: true },
  type: { type: String, enum: app.fieldsTypes, required: true },
  _collection: { type: String }, //for relationOne and relationMany types
  required: { type: Boolean },
  unique: { type: Boolean },
  main: { type: Boolean },
  byDefault: {},
  conditions: {
    betweenLow: {},
    betweenHigh: {},
    size: { type: Number }
  }
});

var collectionSchema = new mongooseConfig.db.Schema ({
  name: { type: String, required: true },
  slug: { type: String },
  _user: { type: String, required: true },
  _fields: [fieldSchema]
    //{ type: mongooseConfig.db.Schema.Types.ObjectId, ref: nameFieldsModel }
});

//Add createAt and updateAt fields to the Schemas
collectionSchema.plugin(mongooseConfig.timestamps);

//Add virtuals to results
/*collectionSchema.set('toJSON', {
   virtuals: true
});*/



//Validations
collectionSchema.path('_fields').validate(function (fields, done) {
  //Check if there is at least one main field
  var messageCheckM = checkOneMainField(fields);
  if (messageCheckM) done(false, messageCheckM);
  var user = this._user;
  //Check if there is a correct collection if the type is relational
  var newFields = _.slice(this.fieldsTypes)
  var messageCheckR = checkRelationals(newFields, user, []);
  if (messageCheckR) done(false, messageCheckR);
  //Check if byDefault values are of the same type indicated in the fields
  var messageCheckD = checkByDefaults(fields);
  if (messageCheckD) done(false, messageCheckD);
  done();
});


//Serials
collectionSchema.pre('save', function(next) {
  this.name = app.toTrim(this.name);
  this.slug = getSlug(this.name);
  _.forIn(this._fields, function(value, key) {
    value.name = app.toTrim(value.name);
  });
  next();
});


//Instance methods
collectionSchema.methods.getNameFields = function(condition) {
  var nameFields = [];
  var fields;
  if (condition) fields = _.filter(this._fields, { [condition]: true });
  else fields = this._fields;
  _.forIn(fields, function(value, key) {
    nameFields.push(value.name);
  });
  return nameFields;
}



//Statics
collectionSchema.statics.generateCollection = function (json, user, fields) {
  _.forIn(fields, function(value, key) {
    if (!_.isUndefined(value._collection)) value._collection = undefined;
    if (!_.isUndefined(value.collection)) value._collection = value.collection;
  });
  return new this ({
    name:    json.name,
    _user:   user.id,
    _fields: fields
  });
}

collectionSchema.statics.findByUser = function (user, cb) {
  return this.find({ _user: user.id }, cb).select('-__v -_user');
}

collectionSchema.statics.findByUserAndId = function (user, id, cb) {
  return this.findOne({ _id: id, _user: user.id }, cb).select('-__v -_user');
}

collectionSchema.statics.findByUserAndSlug = function (user, slugCollection, cb) {
  return this.findOne({ slug: slugCollection, _user: user.id }, cb).select('-__v -_user');
}



//Indexes
collectionSchema.index({ name: 1, _user: 1}, { unique: true });
collectionSchema.index({ slug: 1, _user: 1}, { unique: true });



var model = {
  collectionsModel:   mongooseConfig.db.model(nameCollectionsModel, collectionSchema),
  collectionExists:   collectionExists
};

module.exports = model;
