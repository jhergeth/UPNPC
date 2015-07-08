var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
//  res.render('index', { title: 'Home' });
  res.render('users', {
    'users':users,
    'title':'Users'
  });
//  next();
});

module.exports = router;

var User = function(fname, lname, phone) {
  this.FirstName = fname;
  this.LastName = lname;
  this.Phone = phone;
};

var users = [];

module.exports.init = function() {
  users.push(new User('Matt', 'Palmerlee', '818-123-4567'));
  users.push(new User('Joe', 'Plumber', '310-012-9876'));
  users.push(new User('Tom', 'Smith', '415-567-2345'));
};

module.exports.users = users;
