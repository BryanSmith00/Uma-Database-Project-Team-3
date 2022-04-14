const express = require("express");
const bp = require("body-parser");
var passport = require("passport");
var usersRouter = require("./public/js/users");
const connection = require("./public/js/database");

var app = express();
const port = 3000;
const session = require("express-session");
const file_upload = require("express-fileupload");
const music_metadata = require("music-metadata");

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
app.use(
  file_upload({
    createParentPath: true,
  })
);
app.use(bp.json());
app.use(bp.urlencoded({ extended: false }));

//---------------Passport---------------//

require("./public/js/passport");

/* ------------------ GET Routes --------------------- */

// --------- Initial views ---------- //

//Landing page route
app.get("/", function (req, res, next) {
  res.statusCode = 200;
  res.render("index");
});

app.get("/home", (req, res, next) => {
  // This is how you check if a user is authenticated
  if (req.isAuthenticated()) {
    if(req.user[0].user_type == 0)
      res.redirect('/listener');
    else if(req.user[0].user_type == 1)
      res.redirect('/musician');
    else
      res.redirect('/admin');
  } else {
    res.redirect("/login");
  }
});

//Login page route
app.get("/login", function (req, res, next) {
  res.statusCode = 200;
  res.render("login");
});

app.get("/logout", (req, res, next) => {
  req.logout();
  res.redirect("/");
});

//Good login route
app.get("/login-success", (req, res, next) => {
  res.redirect("/home");
});

//Failed login route
app.get("/login-failure", (req, res, next) => {
  res.send("Your username or password was incorrect");
});

// --------- END Initial views ----------- //

// ---------- Listener & Musician Routes ---------- //

app.get("/listener", function (req, res, next) {
  res.statusCode = 200;

  if (req.isAuthenticated()) {
    var sql1 = `SELECT playlist_id, playlist_name FROM playlist WHERE user_username=\'${req.session.passport.user}\' ORDER BY created_at`;

    var sql2 = "SELECT song_id, song_name, song_file, cover_art, published_by, number_of_plays FROM track";

    connection.query(`${sql1}; ${sql2}`, function (error, results, fields) {
      if (error) throw error;
      //console.log(results[1])
      res.render("listener", {
        data: JSON.stringify(results[1]),
        pl_data: results[0],
        user: req.session.passport.user,
      }
      );
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/musician", function (req, res, next) {
  res.statusCode = 200;

  if (req.isAuthenticated()) {
    var sql1 = `SELECT playlist_name FROM playlist WHERE user_username=\'${req.session.passport.user}\'`;

    var sql2 = "SELECT song_name, published_by, number_of_plays FROM track";

    connection.query(`${sql1}; ${sql2}`, function (error, results, fields) {
      if (error) throw error;

      res.render("musician", {
        data: results[1],
        pl_data: results[0],
        user: req.session.passport.user,
      });
    });
  } else {
    res.redirect("/login");
  }
});

app.get('/addtrack', (req, res, next) => {
    if (req.isAuthenticated()) {
        res.render('upload-track');
    } else {
        res.redirect('/login');
    }
});

//Music player GET

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

//Music player GET
app.get("/music", (req, res, next) => {
  if(req.isAuthenticated())
    res.render("music-player", { user_type: req.user[0].user_type });
  else
    res.redirect('/login')
});


app.get("/songs", function (req, res) {
  res.statusCode = 200;

  if (req.isAuthenticated()) {
    var sql = "SELECT song_id, song_name, published_by, date_added FROM track;";

    connection.query(`${sql}`, function (error, results) {
      if (error) throw error;

      res.render("songs", { songs_report: results });
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/my-playlists", function (req, res, next) {
  res.statusCode = 200;

  if (req.isAuthenticated()) {
    var sql1 = `SELECT * FROM playlist WHERE user_username=\'${req.session.passport.user}\' ORDER BY created_at`;

    var sql2 = `SELECT * FROM playlist WHERE NOT user_username=\'${req.session.passport.user}\'`;

    connection.query(`${sql1}; ${sql2}`, function (error, results, fields) {
      if (error) throw error;

      res.render("playlist", {
        my_pls: results[0],
        other_pls: results[1],
        user: req.session.passport.user,
      });
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/admin-playlist", function (req, res, next) {
  res.statusCode = 200;

  if (req.isAuthenticated()) {
    var sql1 = `SELECT * FROM playlist WHERE user_username=\'${req.session.passport.user}\'`;

    var sql2 = `SELECT * FROM playlist WHERE NOT user_username=\'${req.session.passport.user}\'`;

    connection.query(`${sql1}; ${sql2}`, function (error, results, fields) {
      if (error) throw error;

      res.render("admin-playlist", {
        my_pls: results[0],
        other_pls: results[1],
        user: req.session.passport.user,
      });
    });
  } else {
    res.redirect("/login");
  }
});

app.get('/get-songs', (req, res) => {
  if(!req.isAuthenticated())
    res.redirect('/login')
  //console.log('fetching songs')
  const query =  `SELECT * FROM track`
  connection.query(query, (err, results) => {
    if(err)
      console.log(err)
    else{
      //console.log(results.message)
      res.send(results)
    }
  })
})

app.get("/music/:file_name", (req, res) => {
  res.sendFile(__dirname + `/music/${req.params.file_name}`);
});
app.get("/cover_art/:file_name", (req, res) => {
  res.sendFile(__dirname + `/cover_art/${req.params.file_name}`);
});

//Create playlist form route
app.get("/createplaylist", function (req, res, next) {
  res.statusCode = 200;
  res.render("create-playlist", { user_type: req.user[0].user_type });
});

// --------- END Listener & Musician Routes ---------- //

// ------------- Admin  ------------- //
app.get("/admin", function (req, res) {
  res.statusCode = 200;

  if (req.isAuthenticated()) {
    var sql =
      "SELECT user_id, user_type, handle, username, date_created FROM user";

    connection.query(`${sql}`, function (error, results) {
      if (error) throw error;

      res.render("admin", { users_report: results });
    });
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
// ------------ END Admin -------------- //

/* --------------------- POST Routes --------------------- */
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
app.post("/addtrack", async (req, res, next) => {
  if(req.user[0].user_type !== 1 || !req.isAuthenticated())
    res.send("Unauthorized. Please login to continue.")
  const mp3_file = req.files.trackfile;
  const stripped_song_title = req.body.trackname.replace(/^\s+|\s+$/g, "");
  // couldve used the file name but having the track name enforces continuity and eases querying
  const mp3_path = `${__dirname}/music/${stripped_song_title}.mp3`;
  await mp3_file.mv(mp3_path);
  const duration_minutes = 
    ((await music_metadata.parseFile(mp3_path)).format.duration / 60).toFixed(2)
  ;

  const cover_art = req.files.trackart;
  const cover_ext = cover_art.name.split(".")[1];
  const cover_art_path = `${__dirname}/cover_art/${stripped_song_title}.${cover_ext}`;
    cover_art.mv(cover_art_path);

  // need to change song file in production
  const sql = `INSERT INTO track (song_file, song_name, length, number_of_plays, published_by, cover_art)
              VALUES ("http://localhost:3000/music/${stripped_song_title}.mp3", 
                      "${req.body.trackname}", 
                      ${duration_minutes}, 
                      0, 
                      "${req.user[0].username}", 
                      "http://localhost:3000/cover_art/${stripped_song_title}.${cover_ext}");`;

    connection.query(sql, function (error, results) {
        if (error) throw error;
        res.send('Uploaded sucessfully.')
    });
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

app.post("/my-playlists", (req, res, next) => {
    //console.log(req.user);
    var playlist_name = req.body.playlistname;
    var user_username = req.user[0].username;


    let sql = `INSERT INTO playlist (playlist_name, user_username)
               VALUES (\"${playlist_name}\", \"${user_username}\");`;


    connection.query(sql, function (error, results) {
        if (error) throw error;
        console.log(results.message);
    });

    res.redirect("/my-playlists");
});

app.post("/add-to-playlist", (req, res, next) => {
    //console.log(req.body);
    var playlist_id = req.body.playlist_id;
    var song_id = req.body.song_id;


    let sql = `INSERT INTO contains_tracks
                 (track_song_id, track_published_by, playlist_playlist_ID)
               VALUES ( ${song_id},
                        (SELECT published_by FROM track WHERE song_id=${song_id}),
                       \"${playlist_id}\");`;


    connection.query(sql, function (error, results) {
        if (error) {
            if (error.errno == 1062) return; //duplicate entry
            else throw (error);
        }
    });

    res.redirect("/listener");
});

//--------------Server--------------//

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
