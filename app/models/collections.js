var mongooseConfig = require('../config/db');

var nameCollectionsModel = 'Collection';
var nameFieldsModel = 'Field';

var fieldsTypes = ['Boolean', 'Char', 'String', 'Text', 'Integer', 'Decimal'];


//Generic Functions
var getSlug = function(name) {
  return mongooseConfig.slugify(name.toLowerCase());
};

var collectionExists = function(collections, slugCollection) {
  for (var i=0; i < collections.length; i++) {
    if (collections[i].slug == slugCollection) {
      return true;
    }
  }
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
  slug: { type: String, required: true },
  _user: { type: String, required: true },
  _fields: [fieldSchema]
    //{ type: mongooseConfig.db.Schema.Types.ObjectId, ref: nameFieldsModel }
});


//Add createAt and updateAt fields to the Schemas
collectionSchema.plugin(mongooseConfig.timestamps);


//Add virtuals to results
collectionSchema.set('toJSON', {
   virtuals: true
});



//Instance methods
collectionSchema.methods.getRequiredFields = function() {
  var allFields = this._fields;
  var numFields = 0;
  if (allFields) numFields = allFields.length;
  var requiredFields = [];
  for (var i=0; i < numFields; i++) {
    var field = allFields[i];
    if (field.required)
      requiredFields.push(field.name);
  }
  return requiredFields;
}

collectionSchema.methods.getUniqueFields = function() {
  var allFields = this._fields;
  var numFields = 0;
  if (allFields) numFields = allFields.length;
  var requiredFields = [];
  for (var i=0; i < numFields; i++) {
    var field = allFields[i];
    if (field.unique)
      requiredFields.push(field.name);
  }
  return requiredFields;
}



//Statics
collectionSchema.statics.generateCollection = function (json, user, fields) {
  var name = undefined;
  var slug = undefined;
  if (json.name) {
    name = json.name.trim();
    slug = getSlug(json.name.trim());
  }
  return new this ({
    name:    name,
    slug:    slug,
    _user:   user.id,
    _fields: fields
  });
}

collectionSchema.statics.findByUser = function (user, cb) {
  return this.find({ _user: user.id }, cb);
}

collectionSchema.statics.findByUserAndId = function (user, id, cb) {
  return this.findOne({ _id: id, _user: user.id }, cb);
}

collectionSchema.statics.findByUserAndSlug = function (user, slugCollection, cb) {
  return this.findOne({ slug: slugCollection, _user: user.id }, cb);
}



//Indexes
collectionSchema.index({ name: 1, _user: 1}, { unique: true });
collectionSchema.index({ slug: 1, _user: 1}, { unique: true });



var model = {
  collectionsModel:   mongooseConfig.db.model(nameCollectionsModel, collectionSchema),
  collectionExists:   collectionExists
};

module.exports = model;
