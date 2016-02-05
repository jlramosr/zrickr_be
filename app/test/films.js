var assert      = require('assert'),
    db          = require('../helpers/db'),
    path        = require('path'),
    path_models = '../models',
    model       = require(path.join(__dirname, path_models, 'films'));

describe('Environment', function() {
  describe('#NODE_ENV', function () {
    it('should return test as node environment', function () {
      assert.equal('test', process.env.NODE_ENV);
    });
  });
});
