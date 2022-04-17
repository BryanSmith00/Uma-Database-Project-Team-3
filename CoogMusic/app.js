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
  res.render("index", {user_type: (req.user) ? req.user[0].user_type : null});
});

app.get("/home", (req, res, next) => {
  // This is how you check if a user is authenticated
  if (req.isAuthenticated()) {
    if(req.user[0].user_type == 0)
      res.redirect('/listener');
    else if(req.user[0].user_type == 1)
      res.redirect('/musician-tracks');
    else
      res.redirect('/admin');
  } else {
    res.redirect("/login");
  }
});

//Login page route
app.get("/login", function (req, res, next) {
  res.statusCode = 200;
  (!req.isAuthenticated()) ? res.render("login") : res.render('/');
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

  if (req.isAuthenticated() && req.user[0].user_type === 0) {
    var sql1 = `SELECT playlist_id, playlist_name FROM playlist WHERE user_username=\'${req.session.passport.user}\' ORDER BY created_at`;

    var sql2 = "SELECT * FROM track";

    connection.query(`${sql1}; ${sql2}`, function (error, results, fields) {
      if (error) throw error;
      res.render("listener", {
        data: JSON.stringify(results[1]),
        pl_data: results[0],
        user: req.session.passport.user,
      }
      );
    });
  } else {
    res.redirect("/");
  }
});

app.get("/musician-tracks", function (req, res, next) {
  res.statusCode = 200;

  if (req.isAuthenticated() && req.user[0].user_type === 1) {
    var sql1 = `SELECT * FROM track WHERE published_by=\'${req.session.passport.user}\'`;

    connection.query(`${sql1}`, function (error, results, fields) {
      if (error) throw error;

      res.render("musician-tracks", {
        data: results,
        user: req.session.passport.user,
      });
    });
  } else {
    res.redirect("/");
  }
});

app.get('/addtrack', (req, res, next) => {
    if (req.isAuthenticated() && req.user[0].user_type === 1) {
        res.render('upload-track', {user: req.user[0].username});
    } else {
        res.redirect('/');
    }
});





app.get("/my-playlists", function (req, res, next) {
  res.statusCode = 200;

  if (req.isAuthenticated() && req.user[0].user_type === 0) {
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

app.get("/notifications", function (req, res, next) {
    res.statusCode = 200;

    if (req.isAuthenticated()) {
        var sql = `SELECT * FROM notifications WHERE attached_user = \"${req.session.passport.user}\"`;

        connection.query(sql, (err, results) => {
            if (err) throw (err);
            res.render("notifications", {
                data: results,
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

// --------- END Listener & Musician Routes ---------- //

// ------------- Admin  ------------- //
app.get("/admin", function (req, res) {
  res.statusCode = 200;

  if (req.isAuthenticated() && req.user[0].user_type === 2) {
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
  if (req.isAuthenticated() && req.user[0].user_type === 2) {
    res.render("queries", { user_type: req.user[0].user_type });
  } else {
    res.redirect("/");
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
    res.redirect("/");
  }
});
app.get("/songs", function (req, res) {
  res.statusCode = 200;

  if (req.isAuthenticated() &&  req.user[0].user_type === 2) {
    var sql = "SELECT song_id, song_name, published_by, date_added, number_of_plays FROM track;";

    connection.query(`${sql}`, function (error, results) {
      if (error) throw error;

      res.render("songs", { songs_report: results });
    });
  } else {
    res.redirect("/login");
  }
});
app.get("/admin-playlist", function (req, res, next) {
  res.statusCode = 200;

  if (req.isAuthenticated() && req.user[0].user_type === 2) {
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
app.get("/songReport", (req, res, next) => {
  if (req.isAuthenticated() && req.user[0].user_type === 2) {
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
    res.redirect("/");
  }
});
//
app.get("/albumReport", (req, res, next) => {
  if (req.isAuthenticated() && req.user[0].user_type === 2) {
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
    res.redirect("/");
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
  if(cover_art !== undefined){
    var cover_ext = cover_art.name.split(".")[1];
    var cover_art_path = `${__dirname}/cover_art/${stripped_song_title}.${cover_ext}`;

    var sql = `INSERT INTO track (song_file, song_name, length, published_by, cover_art)
    VALUES ("http://localhost:3000/music/${stripped_song_title}.mp3", 
            "${req.body.trackname}", 
            ${duration_minutes}, 
            "${req.user[0].username}", 
            "http://localhost:3000/cover_art/${stripped_song_title}.${cover_ext}");`;

    cover_art.mv(cover_art_path);
  }else{
      var sql = `INSERT INTO track (song_file, song_name, length, published_by)
              VALUES ("http://localhost:3000/music/${stripped_song_title}.mp3", 
                      "${req.body.trackname}", 
                      ${duration_minutes},  
                      "${req.user[0].username}");`;
  }

    connection.query(sql, function (error, results) {
        if (error) throw error;
        res.redirect('/musician-tracks')
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

app.post("/delete-playlist", (req, res, next) => {
    var playlist_id = req.body.playlist_id;


    let sql = `DELETE FROM playlist WHERE playlist_ID = \"${playlist_id}\"`

    connection.query(sql, function (error, results) {
        if (error) throw (error);
    });

    res.redirect("/my-playlists");
});

app.post("/delete-song", (req, res, next) => {
  var song_id = req.body.song_id;

  let sql = `DELETE FROM track WHERE song_id = ${song_id}`

  connection.query(sql, function (error, results) {
      if (error) throw (error);
      console.log(results.message);
  });

  res.redirect("/musician-tracks");
});

app.post("/delete-song-admin", (req, res, next) => {
  var song_id = req.body.song_id;

  let sql = `DELETE FROM track WHERE song_id = ${song_id}`

  connection.query(sql, function (error, results) {
      if (error) throw (error);
      console.log(results.message);
  });

  res.redirect("songs");
});

app.post("/open-playlist", function (req, res, next) {

    if (req.isAuthenticated()) {
        var playlist_id = req.body.playlist_id;
        var playlist_name = req.body.playlist_name;
        var playlist_creator = req.body.playlist_creator;

        var sql = `SELECT * FROM(track, contains_tracks, playlist)
                   WHERE(
                        playlist_ID = \"${playlist_id}\"
                        && playlist_ID = contains_tracks.playlist_playlist_ID
                        && track.song_id = contains_tracks.track_song_id
                        )`;

        connection.query(sql, function (error, results, fields) {
            if (error) throw error;
            res.render("open-playlist", {
                pl_name: playlist_name,
                pl_creator: playlist_creator,
                pl_id: playlist_id,
                data: JSON.stringify(results),
                user: req.session.passport.user,
            });
        });
    } else {
        res.redirect("/login");
    }

});

app.post("/remove-from-playlist", function (req, res, next) {

    if (req.isAuthenticated()) {
        var playlist_id = req.body.playlist_id;
        var playlist_name = req.body.playlist_name;
        var playlist_creator = req.body.playlist_creator;
        var song_id = req.body.song_id;

        var sql1 = `DELETE FROM contains_tracks
                   WHERE (playlist_playlist_ID = \"${playlist_id}\"
                          && track_song_id = ${song_id});`

        connection.query(sql1, function (error, results, fields) {
            if (error) throw error;
        });

        var sql2 = `SELECT * FROM(track, contains_tracks, playlist)
                   WHERE(
                        playlist_ID = \"${playlist_id}\"
                        && playlist_ID = contains_tracks.playlist_playlist_ID
                        && track.song_id = contains_tracks.track_song_id
                        )`;

        connection.query(sql2, function (error, results, fields) {
            if (error) throw error;
            res.render("open-playlist", {
                pl_name: playlist_name,
                pl_creator: playlist_creator,
                pl_id: playlist_id,
                data: JSON.stringify(results),
                user: req.session.passport.user,
            });
        });

    } else {
        res.redirect("/login");
    }

});

app.post("/edit-playlist", function (req, res, next) {

    if (req.isAuthenticated()) {
        var playlist_id = req.body.playlist_id;
        var playlist_name = req.body.playlist_name;
        var playlist_creator = req.body.playlist_creator

        var sql1 = `UPDATE playlist
                   SET playlist_name = \"${playlist_name}\"
                   WHERE playlist_ID = \"${playlist_id}\"`;


        var sql2 = `SELECT * FROM(track, contains_tracks, playlist)
                   WHERE(
                        playlist_ID = \"${playlist_id}\"
                        && playlist_ID = contains_tracks.playlist_playlist_ID
                        && track.song_id = contains_tracks.track_song_id
                        )`;

        connection.query(`${sql1}; ${sql2}`, function (error, results, fields) {
            if (error) throw error;
            res.render("open-playlist", {
                pl_name: playlist_name,
                pl_creator: playlist_creator,
                pl_id: playlist_id,
                data: JSON.stringify(results[1]),
                user: req.session.passport.user,
            });
        });

    } else {
        res.redirect("/login");
    }

});

app.post("/dismiss-notification", (req, res, next) => {
    if (req.isAuthenticated()) {
        var alert_id = req.body.alert_id;

        let sql = `DELETE FROM notifications 
                   WHERE alert_id = ${alert_id}`;

        connection.query(sql, function (error, results) {
            if (error) throw (error);
        });

        res.redirect("/notifications");

    } else {
        res.redirect("/login");
    }
});

app.post("/edit-song", (req, res, next) => {
    var track_id = req.body.track_id;
    var track_name = req.body.track_name;

    let sql = `UPDATE track
               SET song_name = \"${track_name}\"
               WHERE song_id = ${track_id}`;

    connection.query(sql, function (error, results) {
        if (error) throw (error);
        console.log(results.message);
    });

    res.redirect("/musician-tracks");
});

app.post("/edit-song-admin", (req, res, next) => {
  var track_id = req.body.track_id;
  var track_name = req.body.track_name;
  var number_of_plays = req.body.number_of_plays;
  var date_added = req.body.date_added;

  let sql = `UPDATE track
             SET song_name = \"${track_name}\", number_of_plays = \"${number_of_plays}\", date_added = \"${date_added}\"
             WHERE song_id = ${track_id}`;
  
  connection.query(sql, function (error, results) {
      if (error) throw (error);
      console.log(results.message);
  });

  res.redirect("songs");
});


//--------------Server--------------//

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
