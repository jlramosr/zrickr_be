var db,
    env = process.env.NODE_ENV || 'development',
    name_dbprod = 'zrickr',
    user_dbprod = 'mongo',
    pass_dbprod = '1234',
    name_dbtest = 'pruebas',
    user_dbtest = 'mongo',
    pass_dbtest = '1234',
    err = false;

if ('development' == env) {
  db = require('monk')('localhost/' + name_dbprod, {username: user_dbprod, password: pass_dbprod});
}
else if ('production' == env) {
  db = require('monk')('localhost/' + name_dbprod, {username: user_dbprod, password: pass_dbprod});
}
else if ('test' == env) {
  db = require('monk')('localhost/' + name_dbtest, {username: user_dbtest, password: pass_dbtest});
}
else {
  err = true;
}

if (err) {
  console.error("There's no environment to connect database");
}
else {
  console.log("I'm on " + env + " environment");
}

module.exports = db;
