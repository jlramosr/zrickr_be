var mongooseConfig = require('../config/db');

var nameCollectionsModel = 'Collection';
var nameFieldsModel = 'Field';
var nameZrickersModel = 'Zricker';

var fieldsTypes = ['Boolean', 'Char', 'String', 'Text', 'Integer', 'Decimal'];

//Schemas
var fieldSchema = new mongooseConfig.db.Schema ({
  name: { type: String, required: true },
  type: { type: String, enum: fieldsTypes, required: true },
  required: { type: Boolean },
  unique: { type: Boolean }
});

var collectionSchema = new mongooseConfig.db.Schema ({
  name: { type: String, required: true },
  _user: { type: String, required: true },
  _fields: [fieldSchema]
    //{ type: mongooseConfig.db.Schema.Types.ObjectId, ref: nameFieldsModel }
});

var zrickrSchema = new mongooseConfig.db.Schema ({
  _collection: { type: String, required: true },
  values : {}
}, {strict: false});


//Add createAt and updateAt fields to the Schemas
collectionSchema.plugin(mongooseConfig.timestamps);
zrickrSchema.plugin(mongooseConfig.timestamps);
/*fieldSchema.plugin(mongooseConfig.timestamps);*/



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

//Statics
collectionSchema.statics.generateCollection = function (json, user, fields) {
  return new this ({
    name:   json.name,
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

collectionSchema.statics.findByUserAndName = function (user, nameCollection, cb) {
  //if (!collection) collection = "";
  return this.findOne({ name: nameCollection, _user: user.id }, cb);
}

zrickrSchema.statics.generateZrickr = function (json, collection) {
  var zrickr = new this ({
    _collection: collection.name, // =json.collection
    values: {}
  }, {strict: false});
  if (collection) {
    for (var i=0; i < collection._fields.length; i++) {
      var nameField = collection._fields[i].name;
      zrickr.values[nameField] = json[nameField];
    }
  }
  return zrickr;
}


zrickrSchema.statics.findByCollection = function (nameCollection, cb) {
  return this.find({ _collection: nameCollection }, cb).select('-__v -_collection');;
}


//Indexes
collectionSchema.index({ name: 1, _user: 1}, { unique: true });



var model = {
  collectionsModel:   mongooseConfig.db.model(nameCollectionsModel, collectionSchema),
  zrickersModel:      mongooseConfig.db.model(nameZrickersModel, zrickrSchema),
  /*fieldsModel:        mongooseConfig.db.model(nameFieldsModel, fieldSchema),*/
};

module.exports = model;
