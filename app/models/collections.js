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
  _.forIn(collections, function(value, key) {
    if (value.slug == slugCollection)
      return true;
  });
  return false;
};


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
  //Check if there is one main field at least
  var thereIsOneMainField = false;
  for (var index in fields) {
    if (fields[index].main) {
      thereIsOneMainField = true;
      break;
    }
  }
  if (thereIsOneMainField) done(true);
  else done(false, "It must be at least one main field");
});


//Serials
collectionSchema.pre('save', function(next) {
  this.name = this.name.trim();
  this.slug = getSlug(this.name);
  for (var index in this._fields)
    if (this._fields[index].name)
      this._fields[index].name = this._fields[index].name.trim();
  next();
});


//Instance methods
collectionSchema.methods.getNameFields = function(condition) {
  var allFields = this._fields;
  var numFields = 0;
  if (allFields) numFields = allFields.length;
  var fields = [];
  for (var i=0; i < numFields; i++) {
    var field = allFields[i];
    if (condition === "required" && field.required) {
      fields.push(field.name);
      continue;
    }
    else if (condition === "unique" && field.unique) {
      fields.push(field.name);
      continue;
    }
    else if (condition === "main" && field.main) {
      fields.push(field.name);
      continue;
    }
    else if (!condition) {
      fields.push(field.name);
      continue;
    }
  }
  return fields;
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
