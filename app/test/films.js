process.env.NODE_ENV = 'test';
var assert      = require('assert'),
    path        = require('path'),
    model_controllers = '../models',
    model       = require(path.join(__dirname, model_controllers, 'films'));

describe('Films', function() {
  describe('#Insert', function() {
    it('lala', function () {
      /*
      model.findFilms({}, function(films) {
        console.log('hola');
        assert.equal(1,films)
        done();
      });*/
      /*
      model.insertFilm({title:'holaholahola'});
      model.getNumFilms({}).then(function(count) {
          assert.equal(0,count);
        }).catch(function(err) {
          assert.equal(0,-1);
        });*/
    });
  });
});
