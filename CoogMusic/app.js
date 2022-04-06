const express = require('express');
const bp = require('body-parser')
var passport = require('passport');
var usersRouter = require('./public/js/users');
const connection = require('./public/js/database');

var app = express();
const port = 3000;
const session = require('express-session');

//---------------Session stup---------------//

app.set('trust proxy', 1) // trust first proxy

app.use(session({
    secret: "tempsecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
}));

app.use(passport.initialize());
app.use(passport.session());

//Additional middleware 
app.use(express.static(__dirname));
app.use(bp.json())
app.use(bp.urlencoded({ extended: false }))


//---------------Passport---------------//

require('./public/js/passport');


//--------------Routes--------------//
//GET

//Landing page route
app.get('/', function(req, res, next) {
    res.statusCode = 200;
    
    if (req.isAuthenticated()) {
        res.sendFile(__dirname + '/views/homepage.html');
    } else {
        res.redirect('/login');
    }
    
});

//Login page route
app.get('/login', function(req, res, next) {
    res.statusCode = 200;
    res.sendFile(__dirname + "/views/login.html");
});

//Signup page GET
app.get('/signup', function (req, res, next) {
    res.statusCode = 200;
    res.sendFile(__dirname + "/views/signup.html");
});

//Upload standalone track GET
app.get('/upload-standalone-track', function (req, res, next) {
    res.statusCode = 200;
    res.sendFile(__dirname + "/views/upload-standalone-track.html");
});

//Upload album GET
app.get('/upload-album', function (req, res, next) {
    res.statusCode = 200;
    res.sendFile(__dirname + "/views/upload-album.html");
});

//Music player GET
app.get('/music', (req, res, next) =>{
    res.sendFile(__dirname + "/views/music-player.html");
})

//Good login route
app.get('/login-success', (req, res, next) =>{
    res.redirect('/home');
})

//Failed login route
app.get('/login-failure', (req, res, next) =>{
    res.send("Your username or password was incorrect");
})

app.get('/home', (req, res, next) => {
   
    // This is how you check if a user is authenticated
    if (req.isAuthenticated()) {
        res.sendFile(__dirname + '/views/homepage.html');
    } else {
        res.redirect('/login');
    }
});

app.get('/admin', (req, res, next) => {
   
    // This is how you check if a user is authenticated
    if (req.isAuthenticated()) {
        res.sendFile(__dirname + "/views/admin.html");
    } else {
        res.redirect('/login');
    }
});

app.get('/songs', (req, res, next) => {
   
    // This is how you check if a user is authenticated
    if (req.isAuthenticated()) {
        res.sendFile(__dirname + "/views/songs.html");
    } else {
        res.redirect('/login');
    }
});

app.get('/albums', (req, res, next) => {
   
    // This is how you check if a user is authenticated
    if (req.isAuthenticated()) {
        res.sendFile(__dirname + "/views/albums.html");
    } else {
        res.redirect('/login');
    }
});

app.get('/queries', (req, res, next) => {
   
    if (req.isAuthenticated()) {
        res.sendFile(__dirname + '/views/queries.html');
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
});

app.get('/userReport', (req, res, next) => {
    if (req.isAuthenticated()) {
        connection.query("SELECT user_id, username, date_created FROM user", function (error, results, fields) {
            if (error) throw error;
    
            if(results.length > 0) {
                res.send(results);
            }
            else{
                res.send('<H1>There were no users in the table</H1>');
            }
        });
    } else {
        res.redirect('/login');
    }
});

app.get('/songReport', (req, res, next) => {
    if (req.isAuthenticated()) {
        connection.query("SELECT song_id, song_name, date_added, length, number_of_plays FROM track", function (error, results, fields) {
            if (error) throw error;
    
            if(results.length > 0) {
                res.send(results);
            }
            else{
                res.send('<H1>There were no tracks in the table</H1>');
            }
        });
    } else {
        res.redirect('/login');
    }
});

app.get('/albumReport', (req, res, next) => {
    if (req.isAuthenticated()) {
        connection.query("SELECT album_id, album_title, release_date FROM album ORDER BY album_id ASC", function (error, results, fields) {
            if (error) throw error;
    
            if(results.length > 0) {
                res.send(results);
            }
            else{
                res.send('<H1>There were no albums in the table</H1>');
            }
        });
    } else {
        res.redirect('/login');
    }
});

app.get('/addtrack', (req, res, next) => {
    if (req.isAuthenticated()) {
        res.sendFile(__dirname + '/views/upload-standalone-track.html');
    } else {
        res.redirect('/login');
    }
});


//POST

//Login page route
//app.post("/login", passport.authenticate('local'), (req, res, next) => {});
app.post('/login', passport.authenticate('local', { failureRedirect: '/login-failure', successRedirect: 'login-success' }), (err, req, res, next) => {
    if (err) res.send(err); next(err);
});

//Signup page route (w/out any validation)
app.post("/signup", (req, res, next) => {
    //console.log(req.body);
    let email = req.body.email;
    let username = req.body.username;
    let handle = req.body.handle;
    let pass = req.body.password;
    let user_type = req.body.artist_account == "artist_account" ? 1 : 0;
    let user_perm = user_type;

    let sql = `INSERT INTO user (username, handle, pass, user_type, user_perm) 
    VALUES (${username}, ${handle}, ${pass}, ${user_type}, ${user_perm})`;

    /*connection.query(sql, function (error, results) {
        if (error) throw error;
        console.log(results.message);
    });*/

});

//Upload standalone track form route (w/out any validation)
app.post("/addsong", (req, res, next) => {
    console.log(req.body);
    let song_name = req.body.track;
    let song_file = req.body.trackfile;
    let track_image = req.body.trackart;
    //need to know what user is adding track to pass into table

    let sql = `INSERT INTO track (song_name, song_file, track_image) 
    VALUES (${song_name}, ${song_file}, ${track_image})`;

    /*
    connection.query(sql, function (error, results) {
        if (error) throw error;
        console.log(results.message);
    });
    */

});

//Upload album form route (w/out any validation)
app.post("/upload-album", (req, res, next) => {
    console.log(req.body);
    let albumtitle = req.body.albumtitle;
    let albumart = req.body.albumart;
    let tracknames = req.body.trackname.slice(1);
    let trackfiles = req.body.trackfile.slice(1);
    let featuredartists = req.body.featuredartist.slice(1);
    //need to know what user is adding track to pass into table

    /*let sql = `INSERT INTO track (song_name, song_file, track_image) 
    VALUES (${song_name}, ${song_file}, ${track_image})`;*/

    /*
    connection.query(sql, function (error, results) {
        if (error) throw error;
        console.log(results.message);
    });
    */

});


//--------------Server--------------//

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
}); 