var mongoose = require('../helpers/db');

var nameModel = 'Film';

//Schemas
var imagesSchema = new mongoose.db.Schema ({
  kind: { type: String, enum: ['thumbnail', 'detail'], required: true },
  url: { type: String, required: true }
});

var filmSchema = new mongoose.db.Schema ({
  title: { type: String, required: true },
  images: [imagesSchema],
  genre: { type: String, enum: ['Thriller', 'Adventures', 'Drama'] },
  colour: { type: Boolean },
  year: { type: Number, required: true },
  summary:  { type: String },
});
//Add createAt and updateAt fields to the Schema
filmSchema.plugin(mongoose.timestamps);


//Validations
filmSchema.path('title').validate(function (value) {
  return ((value != "") && (value != null));
}, 'Invalid title');

filmSchema.path('year').validate(function (value) {
  return ((value <= 3000) && (value >= 1000));
}, 'Invalid year');


//Instance methods
filmSchema.methods.updateFilm = function (json) {
  if (json.title != null) this.title = json.title;
  if (json.images != null) this.images = json.images;
  if (json.genre != null) this.genre = json.genre;
  if (json.colour != null) this.colour = json.colour;
  if (json.year != null) this.year  = json.year;
  if (json.summary != null) this.summary = req.body.summary;
}

filmSchema.methods.findSimilarFilms = function (films) {
  return this.model(nameModel).find({ genre: this.genre }, films);
}


//Statics
filmSchema.statics.createFilm = function (json) {
  return new this ({
    title:    json.title,
    images:   json.images,
    genre:    json.genre,
    colour:   json.colour,
    year:     json.year,
    summary:  json.summary
  });
}

filmSchema.statics.findByTitle = function (title, films) {
  return this.find({ title: new RegExp(title, 'i') }, films);
}



//Virtuals
filmSchema.virtual('titleUnique').get(function () {
  return this.title.toLowerCase().replace(/ /g,'') + this.year.toString();
});


var model = mongoose.db.model(nameModel, filmSchema);

module.exports = model;
