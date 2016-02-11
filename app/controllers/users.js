var express = require('express');

var controller = {
  get: function (req, res) {
    res.send('users');
  }
}

module.exports = controller;
