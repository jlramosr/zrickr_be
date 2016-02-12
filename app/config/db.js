var name_dbprod = 'zrickr';
var user_dbprod = 'mongo';
var pass_dbprod = '1234';
var name_dbtest = 'test';
var user_dbtest = 'mongo';
var pass_dbtest = '1234';
var env         = process.env.NODE_ENV || 'development';
var err         = false;

var mongoose = {
  db:          require('mongoose'),
  timestamps:  require('mongoose-timestamp'),
  slugify:     require('slugify'),
  bcrypt:      require('bcrypt')
}

var _startDB = function (namedb) {
  mongoose.db.connect('mongodb://localhost/' + namedb, function(err, res) {
    if(err) {
      console.log('ERROR: connecting to Database. ' + err);
    } else {
      console.log('Connected to Database ' + namedb);
    }
  });
}

if ('development' == env || 'production' == env) {
  _startDB(name_dbprod);
}
else if ('test' == env) {
  _startDB(name_dbtest);
}
else {
  err = true;
}

if (err) {
  console.error("There's no Environment to Connect Database");
}
else {
  console.log("I'm on " + env + " Environment");
}

module.exports = mongoose;
