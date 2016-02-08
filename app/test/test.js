var assert = require('assert'),
    monk = require("monk");

describe('Array', function() {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    });
  });
});

describe('Monk', function() {
  describe('#connection', function () {
    it("is easy to connect", function (done) {
    		var db = monk('localhost/zrick');
    		assert.notStrictEqual(db, undefined);
    		done();
    	});

    	it("is easy to get hold of a collection", function (done) {
    		var db = monk('localhost/testingMonk');
    		var collection = db.get("films");
    		assert.notStrictEqual(collection, undefined);
    		done();
    	});

  });
});
