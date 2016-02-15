var error = {

  manageError : function (res, err, statusCode, messageConsole, messageJSON, summaryJSON) {
    res.statusCode = statusCode;
    var resJSON = { error: messageJSON };
    if (summaryJSON) {
      resJSON.summary = summaryJSON;
    }
    if (!err) {
      console.log('%s(%d): %s', messageConsole, res.statusCode, "");
    }
    else {
      if (!err.message) {
        console.log('%s(%d): %s', messageConsole, res.statusCode, "");
      }
      else {
        console.log('%s(%d): %s', messageConsole, res.statusCode, err.message);
      }
      if (err.errors && !summaryJSON) {
        resJSON.summary = err.errors;
      }
    }
    return res.json(resJSON);
  }
};

module.exports = error;
