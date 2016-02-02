var express = require('express'),
    db = require('monk')('localhost/pruebas'),
    router = express.Router();

router.get('/', function(req, res, next) {
  var posts = db.get('posts');
  posts.find({}, {sort: {title: 1}}, function (err, docs) {
    console.log(posts);
    res.json(docs);
  });
});

module.exports = router;
