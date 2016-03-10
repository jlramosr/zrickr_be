var logger = require("../config/logger");

var _ = require("lodash");
var errors = require("errors");


var getError = function (error) {
  return ({
    error: error.name,
    code: error.code,
    message: error.message || error.defaultMessage,
    explanation: error.explanation || error.defaultExplanation,
    response: error.response || error.defaultResonse
  });
}

errors.json = function (res, error) {

  var errorName = error.name;
  var lastKeyMessage = _.findLastKey(error.errors,'message');
  var message = error.message;
  if (lastKeyMessage) message = error.errors[lastKeyMessage].message;

  //Validation Errors
  if (errorName == 'ValidationError') {
    error.message = message;
    error.code = 404;
  }

  //Cast Errors
  if (error.name == 'CastError') {
    error.code = 404;
    error.message = error.value + ' does not exist';
  }

  //Mongo Errors
  if (errorName == 'MongoError') {
    if (error.code === 11000) {
      error.explanation = message;
      error.message = 'Duplicate values';
      error.code = 404;
    }
  }

  //Generate code of error
  if (!error.code) error.code = 500;
  if (error.code >= 400 || error.code < 500)
    logger.warn(errorName + ' ' +  error.message);
  else
    logger.error(errorName +  ' ' + error.message);


  res.status(error.code).json(getError(error));
}

/* Deprecated */
errors.manageError = function (res, err, statusCode, messageConsole, messageJSON, summaryJSON) {
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
      if (err.message && !summaryJSON) {
        resJSON.summary = err.message;
      }
    }
    return res.json(resJSON);
  };

/*errors.create({
  name: 'FileNotFoundError',
  defaultMessage: 'The requested file could not be found',
  defaultExplanation: 'The file /home/boden/foo could not be found',
  defaultResponse: 'Verify the file exists and retry the operation'
});*/

module.exports = errors;
