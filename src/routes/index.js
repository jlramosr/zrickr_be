var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Zrickr API REST'  });
});

module.exports = router;
