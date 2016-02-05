var db = require('../helpers/db'),
    films_collection = db.get('films');

var findFilms = function (filter) {
  if (filter === undefined) {
    filter = {};
  }
  return new Promise(function(resolve, reject) {
    films_collection.find(filter, {sort: {title: 1}}, function (err, docs) {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  });
}

var insertFilm = function (information) {
  if (information === undefined) {
    information = {};
  }
  films_collection.insert(information);
}

var updateFilm = function (filter,information) {
  if (information === undefined) {
    information = {};
  }
  if (filter === undefined) {
    filter = {};
  }
  films_collection.findAndModify(filter, information);
}

var deleteFilm = function (information) {
  if (information === undefined) {
    information = {};
  }
  films_collection.remove(information);
}

module.exports.findFilms = findFilms;
module.exports.insertFilm = insertFilm;
module.exports.updateFilm = updateFilm;
module.exports.deleteFilm = deleteFilm;
