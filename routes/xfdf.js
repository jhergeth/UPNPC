var express = require('express');
var router = express.Router();

/* GET home page. */
router.use('/', function(req, res, next) {
    console.log('GOT: ');
    console.log('req=');
    console.log(req);
    console.log('res=');
    console.log(res);
//  res.render('index', { title: 'Home' });
//  next();
});

module.exports = router;