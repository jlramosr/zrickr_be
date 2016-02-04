var db = require('monk')('localhost/zrickr', {
                            username: 'mongo',
                            password: '1234'
                        }),
    films_collection = db.get('films');

var getFilms = function (filter) {
  if (filter === undefined) {
    filter = {};
  }
  var films = {};
  films_collection.find(filter, {sort: {title: 1}}, function (err, docs) {
  });
  return films;
}

var insertFilm = function (information) {
  if (information === undefined) {
    information = {};
  }
  films_collection.insert(information);
}

exports.getFilms = getFilms;
exports.insertFilm = insertFilm;
