var express   = require('express');

var controller = {
  get: function (req, res) {
    res.render('index', { title: 'Zrickr API REST'  });
  }
}

module.exports = controller;
