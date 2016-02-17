var logger   = require("../config/logger");

var error = {

  manageError : function (res, err, statusCode, messageConsole, messageJSON, summaryJSON) {
    res.statusCode = statusCode;
    var resJSON = { error: messageJSON };
    if (summaryJSON) {
      resJSON.summary = summaryJSON;
    }
    if (!err) {
      logger.warn(messageConsole + '(' + res.statusCode + ') ');
    }
    else {
      logger.error(messageConsole + '(' + res.statusCode + ') ' +  (err.message || ''));
      if (err.errors && !summaryJSON) {
        resJSON.summary = err.errors;
      }
    }
    return res.json(resJSON);
  }
};

module.exports = error;