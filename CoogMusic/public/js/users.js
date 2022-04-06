var express = require('express');
var userQuery = express.userQuery();
var db=require('./database');

//fetch users from MySQL database
userQuery.get('/user', function(req, res, next) {
    var sql='SELECT user_id, username, date_created * FROM user';
    db.query(sql, function (err, data, fields) {
    if (err) throw err;
    res.render('user', { title: 'Users', userData: data});
  });
});

module.exports = userQuery;

