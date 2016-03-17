var mongooseConfig = require('../config/db');
var app = require('../config/app');

var modelU = require('../models/users');

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

var checkRepeatedFields = function(fields) {
  var message;
  if (!app.noRepeat(fields))
    message = "It must not be repeated fields";
  return message;
};

var checkRepeatedShared = function(users) {
  var message;
  if (!app.noRepeat(users))
    message = "It must not be repeated users";
  return message;
};

var checkOneMainField = function(fields) {
  var message;
  if (_.findIndex(fields, { 'main': true }) < 0)
    message = "It must be at least one main field";
  return message;
};

var checkSharedExist = function(shared) {
  var usersNotExist = [];
  _.forEach(shared, function(userId) {
    modelU.model.count({_id: userId}, function (err, count){
      if(count<=0)
        usersNotExist.push(userID);
    });
  });
  if (usersNotExist.length)
    return 'Users ' + usersNotExist + " not found";
  return;
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

var checkRelationalPromise = function(field, user, currentSlug) {
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
          if (err) resolve(err.name);
        });
        promiseInfoCollection.then(function(collection) {
          if (!collection && currentSlug !== collectionSlug)
            resolve('Referenced Collection ' + collectionSlug + ' Not Found');
          else
            resolve();
        });
      }
    }
  });
};

var checkRelationals = function(fields, user, currentSlug) {
  var relationalPromises = [];
  _.forIn(fields, function(value, key) {
    if (_.includes(app.getRelationalTypes(), value.type)) {
      relationalPromises.push(checkRelationalPromise(value, user, currentSlug));
    }
  });
  return Promise.all(relationalPromises).then(
    function(messages) {
      var newMessages = _.pullAll(messages, [ undefined ]);
      if (newMessages.length) return newMessages.join(', ');
      return;
    },
    function(err) {
      return err;
    }
  );
};

//Schemas
var fieldSchema = new mongooseConfig.db.Schema ({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: app.fieldsTypes, required: true, trim: true },
  _collection: { type: String, ref: 'collectionsModel', trim: true }, //for relationOne and relationMany types
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
  name: { type: String, required: true, trim: true },
  slug: { type: String, trim: true },
  _user: { type: String, required: true, ref: 'User', trim: true },
  _fields: [fieldSchema],
  _sharedWith: [{ type: String, ref: 'User', trim: true }]
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
  //Check if there are repeated name fields
  var messageCheckRp = checkRepeatedFields(this.getNameFields());
  if (messageCheckRp) done(false, messageCheckRp);
  //Check if there is at least one main field
  var messageCheckM = checkOneMainField(fields);
  if (messageCheckM) done(false, messageCheckM);
  var user = {id: this._user};
  //Check if there is a correct collection if the type is relational
  var promiseCheckR = checkRelationals(fields, user, getSlug(this.name));
  promiseCheckR.then(
    function (messageCheckR) {
      if (messageCheckR) done(false, messageCheckR);
      //Check if byDefault values are of the same type indicated in the fields
      var messageCheckD = checkByDefaults(fields);
      if (messageCheckD) done(false, messageCheckD);
      done();
    },
    function (err) {
      done(false, err);
    }
  );
});

collectionSchema.path('_sharedWith').validate(function (sharedWith, done) {
  //Check if all ids of users exist
  var messageCheckE = checkSharedExist(sharedWith);
  if (messageCheckE) done(false, messageCheckE);
  //Check if there are repeated users
  var messageCheckRp = checkRepeatedShared(sharedWith);
  if (messageCheckRp) done(false, messageCheckRp);
  done();
});


//Serials
collectionSchema.pre('save', function(next) {
  this.slug = getSlug(this.name);
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

collectionSchema.methods.getRelationalFields = function() {
  var fields = {};
    /* {
          relationOne:  [ { field: collection }, ...],
          relationMany: [ { field: collection }, ...]
       }    */
  var relationalFields = _.filter(this._fields, function(field) {
    return (_.startsWith(field.type, 'relation'));
  });
  _.forIn(relationalFields, function(value, key) {
    var fieldAndCollection = {};
    fieldAndCollection[value.name] = value._collection;
    if (_.isUndefined(fields[value.type]))
      fields[value.type] = [];
    fields[value.type].push(fieldAndCollection);
  });
  return fields;
}

//Statics
collectionSchema.statics.generateCollection = function (json, user, fields, sharedWith) {
  return new this ({
    name:    json.name,
    _user:   user.id,
    _fields: fields,
    _sharedWith: sharedWith
  });
}

collectionSchema.statics.findByUser = function (user, cb) {
  return  this.find({ _user: user.id }, cb)
              .populate('_sharedWith', '-local.password')
              .select('-__v -_user');
}

collectionSchema.statics.findByUserAndId = function (user, id, cb) {
  return  this.findOne({ _id: id, _user: user.id }, cb)
              .populate('_sharedWith', '-local.password')
              .select('-__v -_user');
}

collectionSchema.statics.findByUserAndSlug = function (user, slugCollection, cb) {
  return  this.findOne({ slug: slugCollection, _user: user.id }, cb)
              .populate('_sharedWith', '-local.password')
              .select('-__v -_user');
}



//Indexes
collectionSchema.index({ name: 1, _user: 1}, { unique: true });
collectionSchema.index({ slug: 1, _user: 1}, { unique: true });



var model = {
  collectionsModel:   mongooseConfig.db.model(nameCollectionsModel, collectionSchema),
  collectionExists:   collectionExists
};

module.exports = model;
