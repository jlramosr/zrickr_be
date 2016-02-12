var mongoose = require('../config/db');

var nameModel = 'User';

//Schemas
var userSchema = new mongoose.db.Schema( {
    local            : {
        email        : String,
        password     : String,
    },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }
});

//Statics
userSchema.statics.generateLocalUser = function (json) {
  var user = new this ();
  user.local.email = json.email;
  user.local.password = this.generateHash(json.password);
  return user;
}


//Instance Methods
userSchema.methods.generateHash = function(password) {
  mongoose.bcrypt.genSalt(10, function(err, salt) {
    mongoose.bcrypt.hash(password, salt, function(err, hash) {
      return hash;
    });
  });
};

userSchema.methods.validPassword = function(password) {
  return mongoose.bcrypt.compare(password, this.local.password, function(err, res) {
    return res;
  });
};

var model = mongoose.db.model(nameModel, userSchema);

module.exports = model;
