var mongooseConfig = require('../config/db');

var nameModel = 'User';

//Schemas
var userSchema = new mongooseConfig.db.Schema( {
  local: {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }
  },
  facebook: {
    id           : String,
    token        : String,
    email        : String,
    name         : String
  },
  twitter: {
    id           : String,
    token        : String,
    displayName  : String,
    username     : String
  },
  google: {
    id           : String,
    token        : String,
    email        : String,
    name         : String
  }
});



userSchema.pre('save', function (next) {
  var user = this;
  if (this.isModified('password') || this.isNew) {
    mongooseConfig.bcrypt.genSalt(10, function (err, salt) {
      if (err) {
        return next(err);
      }
      mongooseConfig.bcrypt.hash(user.local.password, salt, function (err, hash) {
        if (err) {
          return next(err);
        }
        user.local.password = hash;
        next();
      });
    });
  }
  else {
    return next();
  }
});


//Statics
userSchema.statics.generateLocalUser = function (json) {
  var user = new this ();
  user.local.email = json.email;
  user.local.password = json.password;
  return user;
}


//Instance Methods
userSchema.methods.comparePassword = function (passw, cb) {
  mongooseConfig.bcrypt.compare(passw, this.local.password, function (err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

//Instance Methods
userSchema.methods.toSecureJSON = function () {
  var secureUser = this;
  secureUser.local.password = undefined;
  return secureUser;
};


var model = mongooseConfig.db.model(nameModel, userSchema);

module.exports = model;
