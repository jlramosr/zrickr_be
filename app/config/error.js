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

  if (errorName == 'ValidationError') {
    error.message = message;
    error.code = 403;
  }

  if (error.name == 'CastError') {
    error.code = 404;
    error.message = error.value + ' does not exist';
  }

  if (errorName == 'MongoError') {
    if (error.code === 11000) {
      error.explanation = message;
      error.message = 'Duplicate values';
      error.code = 409;
    }
  }

  if (errorName == 'SyntaxError') {
      error.explanation = message;
      error.message = 'JSON malformed';
      error.code = 400;
  }

  //Generate code of error
  if (!error.code) error.code = 400;
  if (error.code >= 400 || error.code < 500)
    logger.warn(errorName + ' ' +  error.message);
  else
    logger.error(errorName +  ' ' + error.message);


  res.status(error.code).json(getError(error));
}

/*errors.create({
  name: 'FileNotFoundError',
  defaultMessage: 'The requested file could not be found',
  defaultExplanation: 'The file /home/boden/foo could not be found',
  defaultResponse: 'Verify the file exists and retry the operation'
});*/

module.exports = errors;
