var express = require('express');
var router = express.Router();
var db = require('../helpers/db');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('users');
});

module.exports = router;
