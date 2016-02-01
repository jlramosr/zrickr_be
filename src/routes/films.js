var express = require('express'),
    router = express.Router(),
    db = require('monk')('localhost/pruebas');

router.get('/', function(req, res, next) {
  var posts = db.get('posts');
  posts.find({}, {sort: {title: 1}}, function (err, docs) {
    console.log(posts);
    res.json(docs);
  });
});

module.exports = router;
