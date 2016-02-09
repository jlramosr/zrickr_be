process.env.NODE_ENV = 'test';
var assert      = require('assert'),
    path        = require('path'),
    model_controllers = '../models',
    model       = require(path.join(__dirname, model_controllers, 'films'));

describe('Films', function() {
  describe('#Insert', function() {
    it('films collection should have one more item after one film is inserted', function (done) {
      var promise1 = model.getNumFilms({});
      var promise2 = model.insertFilm({title:'Titanic'});
      var promise3 = model.getNumFilms({});
      var numFilmsBefore;
      promise1.on('complete', function(err, count) {
        numFilmsBefore = count;
        promise2.on('complete', function(err, films) {
          promise3.on('complete', function(err, count) {
            assert.equal(numFilmsBefore + 1,count);
            done();
          });
        });
      });
    });
  });
});

describe('Films', function() {
  describe('#Delete', function() {
    it('films collection should have no items when we delete all items', function (done) {
      var promise1 = model.deleteFilm({});
      var promise2 = model.getNumFilms({});
      var numFilmsBefore;
      promise1.on('complete', function(err, numItemsDelete) {
        promise2.on('complete', function(err, count) {
          assert.equal(0,count);
          done();
        });
      });
    });
  });
});
