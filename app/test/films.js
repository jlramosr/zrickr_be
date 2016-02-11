process.env.NODE_ENV = 'test';

var assert            = require('assert');
var path              = require('path');
var model_controllers = '../models';
var model             = require(path.join(__dirname, model_controllers, 'films'));

describe('Films', function() {
  describe('#Insert', function() {
    it('films collection should have one more item after one film is inserted', function (done) {
      var numFilmsBefore;
      var numFilmsAfter;
      var promise1 = model.count({}, function (err,count) {
        return count;
      });
      promise1.then(function (numFilms1) {
        var film = model.createFilm({title:"Titanic", year:1999});
        var promise2 = film.save(function (err,film) {
          return film;
        });
        promise2.then(function (film) {
          var promise3 = model.count({}, function (err,count) {
            return count;
          });
          promise3.then(function (numFilms2) {
            assert.equal(numFilms1+1,numFilms2);
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
      var promise1 = model.count({}, function (err,count) {
        return count;
      });
      promise1.then(function (numFilms1) {
        var promise2 = model.remove().exec();
        promise2.then(function () {
          var promise3 = model.count({}, function (err,count) {
            return count;
          });
          promise3.then(function (numFilms2) {
            assert.equal(0,numFilms2);
            done();
          });
        });
      });
    });
  });
});
