var mongooseConfig = require('../config/db');

var nameModel = 'User';

//Schemas
userSchema = new mongooseConfig.db.Schema( {
  admin: { type: Boolean, default: false},
  active: { type: Boolean, default: false},
  local: {
    email: { type: String, unique: true},
    password: { type: String }
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
  if (this.isModified('local.password') || this.isNew) {
    console.log("QTAL");
    mongooseConfig.bcrypt.genSalt(10, function (err, salt) {
      if (err) return next(err);
      mongooseConfig.bcrypt.hash(user.local.password, salt, function (err, hash) {
        if (err) return next(err);
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
  user.admin = false;
  user.active = false;
  return user;
};

userSchema.statics.findSecureLocalUser = function (users) {
  return users = this.find({}, users);
}

userSchema.statics.findSecureLocalUserById = function (id, user) {
  return this.findOne({ _id: id }, user).select('-local.password');
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

userSchema.methods.toSecure = function () {
  var secureUser = this;
  secureUser.local.password = undefined;
  return secureUser;
};

userSchema.methods.updateLocalUser = function (json) {
  if (json.local.email != null) this.local.email = json.local.email;
  if (json.local.password != null) this.local.password = json.local.password;
  if (json.admin != null) this.admin = this.admin && json.admin;
  if (json.active != null) this.active = this.active && json.active;
};


var model = {
  model: mongooseConfig.db.model(nameModel, userSchema),
  schema: userSchema
};

module.exports = model;
