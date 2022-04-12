const express = require("express");
const bp = require("body-parser");
var passport = require("passport");
var usersRouter = require("./public/js/users");
const connection = require("./public/js/database");

var app = express();
const port = 3000;
const session = require("express-session");
const { send } = require("express/lib/response");

//---------------Session stup---------------//

app.set("trust proxy", 1); // trust first proxy
app.set("view engine", "ejs");
app.use(
  session({
    secret: "tempsecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

//Additional middleware
app.use(express.static(__dirname));
app.use(bp.json());
app.use(bp.urlencoded({ extended: false }));

//---------------Passport---------------//

require("./public/js/passport");

//--------------Routes--------------//
//GET

//Landing page route
app.get("/", function (req, res, next) {
  res.statusCode = 200;
  res.render("index");
});

app.get("/test", (req, res) => {
  res.render("test", {
    user_type: req.user !== undefined ? req.user[0].user_type : null,
  });

});
//Login page route
app.get("/login", function (req, res, next) {
  res.statusCode = 200;
  res.render("login");
});

//Upload standalone track form route
app.get('/addtrack', (req, res, next) => {
    if (req.isAuthenticated()) {
        res.sendFile(__dirname + '/views/upload-standalone-track.html');
    } else {
        res.redirect('/login');
    }
});

//Upload album form route
app.get('/upload-album', function (req, res, next) {
    res.statusCode = 200;
    res.sendFile(__dirname + "/views/upload-album.html");
});

//Create playlist form route
app.get('/createplaylist', function (req, res, next) {
    res.statusCode = 200;
    res.sendFile(__dirname + "/views/create-playlist.html");
});

//Music player route
app.get('/music', (req, res, next) => {
    res.sendFile(__dirname + "/views/music-player.html");
})

app.get('/home', (req, res, next) => {
   
    // This is how you check if a user is authenticated
    if (req.isAuthenticated()) {
        res.sendFile(__dirname + '/views/homepage.html');
    } else {
        res.redirect('/login');
    }
});


app.get('/admin', function (req, res) {
    res.statusCode = 200;

    if (req.isAuthenticated()) {

        var sql = "SELECT user_id, user_type, handle, username, date_created FROM user";

        connection.query(`${sql}`, function (error, results) {
            if (error) throw error;

            res.render('admin', { users_report: results});
        });

    } else {
        res.redirect('/login');
    }
});

app.get('/songs', function (req, res) {
    res.statusCode = 200;

    if (req.isAuthenticated()) {

        var sql = "SELECT song_id, song_name, published_by, date_added FROM track;";

        connection.query(`${sql}`, function (error, results) {
            if (error) throw error;

            res.render('songs', { songs_report: results});
        });

    } else {
        res.redirect('/login');
    }
});


app.get('/listener', function (req, res, next) {
    res.statusCode = 200;

    if (req.isAuthenticated()) {

        var sql1 = `SELECT playlist_name FROM playlist WHERE user_username=\'${req.session.passport.user}\'`;

        var sql2 = "SELECT song_name, published_by, number_of_plays FROM track";

        connection.query(`${sql1}; ${sql2}`, function (error, results, fields) {
            if (error) throw error;

            res.render('listener', { data: results[1], pl_data: results[0], user: req.session.passport.user });
        });

    } else {
        res.redirect('/login');
    }
});

app.get('/musician', function (req, res, next) {
  res.statusCode = 200;

  if (req.isAuthenticated()) {

      var sql1 = `SELECT playlist_name FROM playlist WHERE user_username=\'${req.session.passport.user}\'`;

      var sql2 = "SELECT song_name, published_by, number_of_plays FROM track";

      connection.query(`${sql1}; ${sql2}`, function (error, results, fields) {
          if (error) throw error;

          res.render('musician', { data: results[1], pl_data: results[0], user: req.session.passport.user });
      });

  } else {
      res.redirect('/login');
  }
});


app.get('/playlists', function (req, res, next) {
    res.statusCode = 200;

    if (req.isAuthenticated()) {

        var sql1 = `SELECT * FROM playlist WHERE user_username=\'${req.session.passport.user}\'`;

        var sql2 = `SELECT * FROM playlist WHERE NOT user_username=\'${req.session.passport.user}\'`;

        connection.query(`${sql1}; ${sql2}`, function (error, results, fields) {
            if (error) throw error;

            res.render('playlist', { my_pls: results[0], other_pls: results[1], user: req.session.passport.user });
        });

    } else {
        res.redirect('/login');
    }
});

//Signup page GET
app.get("/signup", function (req, res, next) {
  res.statusCode = 200;
  res.sendFile(__dirname + "/views/signup.html");
});

//Upload standalone track GET
app.get("/upload-track", function (req, res, next) {
  res.statusCode = 200;
  res.render("upload-track", { user_type: req.user[0].user_type });
});

//Upload album GET
app.get("/upload-album", function (req, res, next) {
  res.statusCode = 200;
  res.render("upload-album", { user_type: req.user[0].user_type });
});

//Music player GET
app.get("/music", (req, res, next) => {
  res.render("music-player", { user_type: req.user[0].user_type });
});

//Good login route
app.get("/login-success", (req, res, next) => {
  res.redirect("/home");
});

//Failed login route
app.get("/login-failure", (req, res, next) => {
  res.send("Your username or password was incorrect");
});

app.get("/home", (req, res, next) => {
  // This is how you check if a user is authenticated
  if (req.isAuthenticated()) {
    res.render("homepage", { user_type: req.user[0].user_type });
  } else {
    res.redirect("/login");
  }
});

app.get("/admin", (req, res, next) => {
  // This is how you check if a user is authenticated
  if (req.isAuthenticated()) {
    if (req.user[0].user_type === 2) res.render("admin");
    else {
        res.redirect("/");
    }
  } else {
    res.redirect("/login");
  }
});

app.get("/songs", (req, res, next) => {
  // This is how you check if a user is authenticated
  if (req.isAuthenticated()) {
    res.render("songs", { user_type: req.user[0].user_type });
  } else {
    res.redirect("/login");
  }
});

app.get("/playlists", (req, res, next) => {
  // This is how you check if a user is authenticated
  if (req.isAuthenticated()) {
    res.render("playlists", { user_type: req.user[0].user_type });
  } else {
    res.redirect("/login");
  }
});

app.get("/queries", (req, res, next) => {
  if (req.isAuthenticated()) {
    res.render("queries", { user_type: req.user[0].user_type });
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res, next) => {
  req.logout();
  res.redirect("/");
});

app.get("/userReport", (req, res, next) => {
  if (req.isAuthenticated()) {
    connection.query(
      "SELECT user_id, username, date_created FROM user",
      function (error, results, fields) {
        if (error) throw error;

        if (results.length > 0) {
          res.send(results);
        } else {
          res.send("<H1>There were no users in the table</H1>");
        }
      }
    );
  } else {
    res.redirect("/login");
  }
});

app.get("/songReport", (req, res, next) => {
  if (req.isAuthenticated()) {
    connection.query(
      "SELECT song_id, song_name, date_added, length, number_of_plays FROM track",
      function (error, results, fields) {
        if (error) throw error;

        if (results.length > 0) {
          res.send(results);
        } else {
          res.send("<H1>There were no tracks in the table</H1>");
        }
      }
    );
  } else {
    res.redirect("/login");
  }
});

app.get("/albumReport", (req, res, next) => {
  if (req.isAuthenticated()) {
    connection.query(
      "SELECT album_id, album_title, release_date FROM album ORDER BY album_id ASC",
      function (error, results, fields) {
        if (error) throw error;

        if (results.length > 0) {
          res.send(results);
        } else {
          res.send("<H1>There were no albums in the table</H1>");
        }
      }
    );
  } else {
    res.redirect("/login");
  }
});

app.get("/addtrack", (req, res, next) => {
  if (req.isAuthenticated()) {
    res.render("upload-track", { user_type: req.user[0].user_type });
  } else {
    res.redirect("/login");
  }
});


//POST

//Login page route
//app.post("/login", passport.authenticate('local'), (req, res, next) => {});
app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login-failure",
    successRedirect: "login-success",
  }),
  (err, req, res, next) => {
    if (err) res.send(err);
    next(err);
  }
);

//Upload standalone track form route (w/out any validation)
app.post("/addsong", (req, res, next) => {
  console.log(req.body);
  let song_name = req.body.track;
  //let song_file = req.body.trackfile;
  //let track_image = req.body.trackart;
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

app.post("/runquery", (req, res, next) => {
  let select_type = req.body.selecttype;
  let order_type = req.body.ordertype;

  if (select_type == "user") {
    if (req.body.sorttype == "id") var sort_type = "user_id";
    if (req.body.sorttype == "name") var sort_type = "username";
    if (req.body.sorttype == "date") var sort_type = "date_created";
  } else if (select_type == "track") {
    if (req.body.sorttype == "id") var sort_type = "song_id";
    if (req.body.sorttype == "name") var sort_type = "song_name";
    if (req.body.sorttype == "date") var sort_type = "date_added";
  } else {
    if (req.body.sorttype == "id") var sort_type = "playlist_id";
    if (req.body.sorttype == "name") var sort_type = "playlist_name";
    if (req.body.sorttype == "date") var sort_type = "created_at";
  }

  var sql = `SELECT * FROM ${select_type} ORDER BY ${sort_type} ${order_type}`;

  connection.query(sql, function (error, results) {
    if (error) {
      res.send(error);
      throw error;
    }

    if (results.length <= 0) res.send("<h1>There were no results</h1>");
    else {
      if (select_type == "user") {
        var tab =
          '<table style="width:50%"> <tr> <th>ID</th> <th>Name</th> <th>Date Created</th> </tr>';
        for (let i = 0; i < results.length; i++) {
          tab +=
            "<tr>" +
            "<td>" +
            results[i].user_id +
            "</td><td>" +
            results[i].username +
            "</td><td>" +
            results[i].date_created +
            "</td></tr>";
        }
        tab += "</table>";
      } else if (select_type == "track") {
        var tab =
          '<table style="width:50%"> <tr> <th>ID</th> <th>Name</th> <th>Date Created</th> </tr>';
        for (let i = 0; i < results.length; i++) {
          tab +=
            "<tr>" +
            "<td>" +
            results[i].song_id +
            "</td><td>" +
            results[i].song_name +
            "</td><td>" +
            results[i].date_added +
            "</td></tr>";
        }
        tab += "</table>";
      } else if (select_type == "playlist") {
        var tab =
          '<table style="width:50%"> <tr> <th>ID</th> <th>Name</th> <th>Date Created</th> </tr>';
        for (let i = 0; i < results.length; i++) {
          tab +=
            "<tr>" +
            "<td>" +
            results[i].playlist_id +
            "</td><td>" +
            results[i].playlist_name +
            "</td><td>" +
            results[i].created_at +
            "</td></tr>";
        }
        tab += "</table>";
      }

      let text = `<!DOCTYPE html><html lang="en">
            <head>
                <meta charset="UTF-8"> <title>Query Results</title> <link rel="icon" type="image/x-icon" href="../public/images/favicon.ico"> <meta name="viewport" content="width=device-width, initial-scale=1"> <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous"> <link rel="stylesheet" href="../public/stylesheets/admin.css" /> <style>table, th, td {border:1px solid black;}</style>
            </head>
            <body>
            <div>
                ${tab}
            </div>
            </body>`;

      res.send(text);
    }
  });
});

//--------------Server--------------//

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
