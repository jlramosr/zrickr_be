var mongooseConfig = require('../config/db');

var modelC = require('../models/collections');

var nameZrickersModel = 'Zricker';


//Schemas
var zrickrSchema = new mongooseConfig.db.Schema ({
  _collection: { type: String, required: true },
  _user: { type: String, required: true },
  values : {}
}, {strict: false});


//Add createAt and updateAt fields to the Schemas
zrickrSchema.plugin(mongooseConfig.timestamps);



//Validations
zrickrSchema.path('values').validate(function (values, done) {
  var user = {id: this._user};
  var requiredFields = [];
  var uniqueFields = [];
  var promise = modelC.collectionsModel.findByUserAndSlug(user, this._collection, function(err, collection) {
    if (err) done(err);
    requiredFields = collection.getRequiredFields();
    uniqueFields = collection.getUniqueFields();
  });
  promise.then(function(collection) {
    for (var index in requiredFields) {
      var requiredField = requiredFields[index];
      if (!values[requiredField]) done(false, requiredField + ' is required');
    }
    //for (var index in uniqueFields) {
      var promise2 = model.zrickersModel.findByUserAndCollection(user, collection.slug, function(err, zrickers) {
        if (err) done(err);
      });
      promise2.then(function(zrickers) {
        if (zrickers.length) {
          var valuesUniquesFieldsThis = {};
          var valuesUniquesFieldsAll = [];
          for (var index in uniqueFields) {
            var uniqueField = requiredFields[index];
            if (values[uniqueField])
              valuesUniquesFieldsThis[uniqueField] = values[uniqueField];
          }
          for (var indexZ in zrickers) {
            var valuesUniquesFieldsCurrent = {};
            for (var indexF in uniqueFields) {
              var uniqueField = requiredFields[indexF];
              if (zrickers[indexZ].values)
                if (zrickers[indexZ].values[uniqueField])
                  valuesUniquesFieldsCurrent[uniqueField] = zrickers[indexZ].values[uniqueField];
            }
            valuesUniquesFieldsAll.push(JSON.stringify(valuesUniquesFieldsCurrent));
          }
          var existe = false;
          for (var i=0; i < valuesUniquesFieldsAll.length ; i++) {
            if (JSON.stringify(valuesUniquesFieldsThis) === valuesUniquesFieldsAll[i]) {
              existe = true;
              break;
            }
          }
          if (existe) done(false, uniqueFields + ' must be unique');
          done(true);
        }
        else done(true);
      })
  })
});



//Instance methods



//Statics
zrickrSchema.statics.generateZrickr = function (json, user, collection) {
  var zrickr = new this ({
    _collection: collection.slug, // =json.collection
    _user: user.id,
    values: {}
  });
  for (var key in collection._fields) {
    var nameKey = collection._fields[key].name;
    zrickr.values[nameKey] = json[nameKey];
  }
  return zrickr;
}

zrickrSchema.statics.findByUser = function (user, cb) {
  return this.find({ _user: user.id }, cb).select('-__v');
}

zrickrSchema.statics.findByUserAndCollection = function (user, slugCollection, cb) {
  return this.find({ _collection: slugCollection, _user: user.id}, cb).select('-__v -_collection');
}

zrickrSchema.statics.findByUserAndCollectionAndId = function (user, slugCollection, id, cb) {
  return this.findOne({ _id: id, _collection: slugCollection, _user: user.id }, cb).select('-__v -_collection');
}


//Indexes


var model = {
  zrickersModel: mongooseConfig.db.model(nameZrickersModel, zrickrSchema),
};

module.exports = model;
