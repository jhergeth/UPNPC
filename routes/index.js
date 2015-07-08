var express = require('express');
var router = express.Router();
/*
var angular = require('angular');
angular.module('upnp',[]);
*/




/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

module.exports = router;
