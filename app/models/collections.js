var mongooseConfig = require('../config/db');

var nameCollectionsModel = 'Collection';
var nameFieldsModel = 'Field';

var fieldsTypes = ['Boolean', 'Char', 'String', 'Text', 'Integer', 'Decimal'];

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
}


//Schemas
var fieldSchema = new mongooseConfig.db.Schema ({
  name: { type: String, required: true },
  type: { type: String, enum: fieldsTypes, required: true },
  required: { type: Boolean },
  unique: { type: Boolean },
  main: { type: Boolean }
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
  var messageCheck = checkOneMainField(fields);
  if (messageCheck) done(false, messageCheck);
  done(true);
});


//Serials
collectionSchema.pre('save', function(next) {
  this.name = this.name.trim();
  this.slug = getSlug(this.name);
  _.forIn(this._fields, function(value, key) {
    value.name = value.name.trim();
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