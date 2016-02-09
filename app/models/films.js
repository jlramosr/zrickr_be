var db = require('../helpers/db');


//Schemas
var imagesSchema = new db.Schema ({
  kind: { type: String, enum: ['thumbnail', 'detail'], required: true },
  url: { type: String, required: true }
});

var filmSchema = new db.Schema ({
  title: { type: String, require: true },
  images: [imagesSchema],
  genre: { type: String, enum: ['Thriller', 'Adventures', 'Drama'] },
  colour: { type: String },
  year: { type: Number, require: true },
  summary:  { type: String },
  modified: { type: Date, default: Date.now }
});


//Validations
filmSchema.path('title').validate(function (v) {
    return ((v != "") && (v != null));
});

filmSchema.path('year').validate(function (v) {
    return ((v <= 3000) && (v >= 1000));
});


module.exports = db.model('Film', filmSchema);
