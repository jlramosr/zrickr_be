var express     = require('express'),
    router      = express.Router(),
    path        = require('path'),
    path_models = '../models',
    model       = require(path.join(__dirname, path_models, 'films'));

router.get('/', function(req, res, next) {
  var films = model.getFilms();
  res.json(films);
});

router.get('/insert/:title?', function(req, res, next) {
  var inf = {}
  var new_title = req.params.title
  if (new_title !== undefined) {
    inf = {
      title: new_title,
      year: 1999
    };
    model.insertFilm(inf);
  }
  res.json(model.getFilms(inf));
});

router.get('/delete/:title?', function(req, res, next) {
  var filter = {}
  if (req.params.title !== undefined) {
    var del_title = req.params.title;
    filter = {
      title: del_title
    };
  }
  model.films.remove(filter);
  res.json(model.getFilms());
});

module.exports = router;
