const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const connection = require('./database');

const verifyCallback = (username, password, done) => {

    connection.query("SELECT * FROM user WHERE username= ? AND pass = ?", [username, password], function (error, results, fields) {
        if (error) throw error;

        if(results.length > 0) {
            return done(null, results);
        }else{
            return done(null, false);
        }
    });
}

const strategy  = new LocalStrategy(verifyCallback);

passport.use(strategy);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser((user, done) => {
    
    connection.query("SELECT * FROM user WHERE username= ?", [user], function (error, results, fields) {
        if (error) throw error;

        if(results.length > 0) {
            return done(null, results);
        }
    });

    /*
    User.findById(userId)
        .then((user) => {
            done(null, user);
        })
        .catch(err => done(err))*/
});