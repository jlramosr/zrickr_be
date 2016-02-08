var db = require('../helpers/db'),
    films_collection = db.get('films');

var model = {
  findFilms: function (filter) {
    return films_collection.find(filter, {sort: {title: 1}});
  },

  getNumFilms: function(filter) {
    return films_collection.count(filter);
  },

  insertFilm: function(information) {
    return films_collection.insert(information);
  },

  updateFilm: function(filter,information) {
    return films_collection.findAndModify(filter, information);
  },

  deleteFilm: function(information) {
    return films_collection.remove(information);
  }
}

module.exports = model;
