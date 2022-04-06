const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
var http = require('http');
const bp = require('body-parser')
var mysql = require('mysql');
const app = express();
const port = 3000;

app.use(express.static(__dirname));
app.use(bp.json())
app.use(bp.urlencoded({ extended: false }))
 

//--------------HTTP GET functions--------------//

//Landing page GET
app.get('/', function(req, res, next) {
    res.statusCode = 200;
    res.sendFile(__dirname + "/views/index.html");
});

//Login page GET
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
    res.sendFile(__dirname + "/views/music-player.html")
})


//--------------HTTP POST functions--------------//

//Login page POST
app.post("/login", (req, res, next) => {
    console.log(req.body)
    let username = req.body.username;
    let password = req.body.password;
    //res.send(`Username: ${username} Password: ${password}`);

    //Establishes the connection to the mysql server
    var connection = mysql.createConnection({
        host: "team-3-3380.cbbxip0p57sn.us-east-2.rds.amazonaws.com",
        user: "admin",
        password: "*ZrYDzw*Puctowy\$nf42",
        database: "coog_music"
      });
    
    connection.connect(function(err) {
        if (err) throw err;
        else
            console.log("successful connection");

      });
    
    connection.query("SELECT * FROM user WHERE username= ? AND pass = ?", [username, password], function (error, results, fields) {
        if (error) throw error;

        if(results.length > 0) {
            res.send('succcessfully logged in');
        }else{
            res.send('username or password is incorrect');
        }
      });
});

//Signup page POST (w/out any validation)
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

    //Establishes the connection to the mysql server
    var connection = mysql.createConnection({
        host: "team-3-3380.cbbxip0p57sn.us-east-2.rds.amazonaws.com",
        user: "admin",
        password: "*ZrYDzw*Puctowy\$nf42",
        database: "coog_music"
    });

    connection.connect(function (err) {
        if (err) throw err;
        else
            console.log("successful connection");

    });

    connection.query(sql, function (error, results) {
        if (error) throw error;
        console.log(results.message);
    });

});

//Upload standalone track form POST (w/out any validation)
app.post("/upload-standalone-track", (req, res, next) => {
    console.log(req.body);
    let song_name = req.body.track;
    let song_file = req.body.trackfile;
    let track_image = req.body.trackart;
    //need to know what user is adding track to pass into table

    let sql = `INSERT INTO track (song_name, song_file, track_image) 
    VALUES (${song_name}, ${song_file}, ${track_image})`;

    //Establishes the connection to the mysql server
    var connection = mysql.createConnection({
        host: "team-3-3380.cbbxip0p57sn.us-east-2.rds.amazonaws.com",
        user: "admin",
        password: "*ZrYDzw*Puctowy\$nf42",
        database: "coog_music"
    });

    connection.connect(function (err) {
        if (err) throw err;
        else
            console.log("successful connection");

    });

    /*
    connection.query(sql, function (error, results) {
        if (error) throw error;
        console.log(results.message);
    });
    */

});

//Upload album form POST (w/out any validation)
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

    //Establishes the connection to the mysql server
    var connection = mysql.createConnection({
        host: "team-3-3380.cbbxip0p57sn.us-east-2.rds.amazonaws.com",
        user: "admin",
        password: "*ZrYDzw*Puctowy\$nf42",
        database: "coog_music"
    });

    connection.connect(function (err) {
        if (err) throw err;
        else
            console.log("successful connection");

    });

    /*
    connection.query(sql, function (error, results) {
        if (error) throw error;
        console.log(results.message);
    });
    */

});




app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    console.log(__dirname);
});


