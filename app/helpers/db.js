var env = process.env.NODE_ENV || 'development',
    name_dbprod = 'zrickr',
    user_dbprod = 'mongo',
    pass_dbprod = '1234',
    name_dbtest = 'test',
    user_dbtest = 'mongo',
    pass_dbtest = '1234',
    db = require("mongoose"),
    err = false;

var _startDB = function (namedb) {
  db.connect('mongodb://localhost/' + namedb, function(err, res) {
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

module.exports = db;
