const express = require("express");
const bp = require("body-parser");
var passport = require("passport");
const connection = require("./public/js/database");

var app = express();
const port = 3000;
const process = require('process')
const session = require("express-session");
const file_upload = require("express-fileupload");
const music_metadata = require("music-metadata");

var flash = require("connect-flash");

//---------------Session setup---------------//

const isProd = process.env.NODE_ENV || 'development'
const devRoute = "http://localhost:3000/"
const prodRoute = "http://coogmusic.com/"
const route = (isProd == 'development') ? devRoute : prodRoute

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

app.use(flash());

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
    res.render("index", { user_type: req.user ? req.user[0].user_type : null });
});

app.get("/home", (req, res, next) => {
    // This is how you check if a user is authenticated
    if (req.isAuthenticated()) {
        if (req.user[0].user_type == 0) res.redirect("/listener");
        else if (req.user[0].user_type == 1) res.redirect("/musician-tracks");
        else res.redirect("/admin");
    } else {
        res.redirect("/login");
    }
});

//Login page route
app.get("/login", function (req, res, next) {
    res.statusCode = 200;
    !req.isAuthenticated() ? res.render("login") : res.render("/");
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
        var sql1 = `SELECT playlist_id, playlist_name, is_private 
                FROM playlist WHERE user_username=\'${req.session.passport.user}\' 
                ORDER BY created_at`;

        var sql2 = "SELECT * FROM track";

        var sql3 = `SELECT song_id 
                FROM (user, track, contains_tracks) 
                WHERE (song_id = track_song_id 
                       && playlist_playlist_id = personal_playlist_id
                       && username = \"${req.session.passport.user}\")`;

        var msg = req.flash("message");

        connection.query(`${sql1}; ${sql2}; ${sql3}`, function (error, results, fields) {

            if (error) throw error;
            var personal_pl_id;
            results[0].forEach(function (playlist) {
                if (playlist.is_private === 1) personal_pl_id = playlist.playlist_id;
            });

            var fav_data = results[2].map(function (e) {
                return e.song_id;
            });

            res.render("listener", {
                personal_pl_id: personal_pl_id,
                data: JSON.stringify(results[1]),
                pl_data: results[0],
                fav_data: fav_data,
                message: msg,
                user: req.session.passport.user,
                curr_route: (isProd == 'development') ? devRoute : prodRoute
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

app.get("/addtrack", (req, res, next) => {
    if (req.isAuthenticated() && req.user[0].user_type === 1) {
        res.render("upload-track", { user: req.user[0].username });
    } else {
        res.redirect("/");
    }
});

app.get("/my-playlists", function (req, res, next) {
    res.statusCode = 200;


    if (req.isAuthenticated() && req.user[0].user_type === 0) {
        var sql1 = `SELECT * FROM playlist 
                  WHERE user_username=\'${req.session.passport.user}\' && is_private=0
                  ORDER BY created_at`;

        var sql2 = `SELECT * FROM playlist 
                  WHERE NOT user_username=\'${req.session.passport.user}\' && is_private=0`;

        connection.query(`${sql1}; ${sql2}`, function (error, results, fields) {
            if (error) throw error;
            res.render("playlist", {
                my_pls: results[0],
                other_pls: results[1],
                user: req.session.passport.user,
                curr_route: (isProd == 'development') ? devRoute : prodRoute
            });
        });
    } else {
        res.redirect("/login");
    }
});

app.get("/my-favorites", function (req, res, next) {
    res.statusCode = 200;

    if (req.isAuthenticated() && req.user[0].user_type === 0) {
        var sql = `SELECT * FROM(track, contains_tracks, user, playlist)
                    WHERE(playlist_playlist_ID = user.personal_playlist_ID
                          && playlist_ID=playlist_playlist_ID
                          && username=\"${req.user[0].username}\"
                          && track_song_id=song_id)
                    ORDER BY created_at`;

        connection.query(sql, function (error, results, fields) {
            if (error) throw error;
            res.render("open-playlist", {
                pl_name: "My Favorites",
                pl_creator: req.user[0].username,
                pl_id: req.user[0].personal_playlist_ID,
                is_private: 1,
                data: JSON.stringify(results),
                user: req.session.passport.user,
                curr_route: (isProd == 'development') ? devRoute : prodRoute
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
            if (err) throw err;
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

app.get("/music/:file_name", (req, res) => {
    res.sendFile(__dirname + `/music/${req.params.file_name}`);
});
app.get("/cover_art/:file_name", (req, res) => {
    res.sendFile(__dirname + `/cover_art/${req.params.file_name}`);
});

// --------- END Listener & Musician Routes ---------- //

// ------------- Admin Dashboard ------------- //
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
        res.redirect("/login");
    }
});


app.get("/reports", (req, res, next) => {
    if (req.isAuthenticated() && req.user[0].user_type === 2) {
        res.render("reports", { user_type: req.user[0].user_type });
    } else {
        res.redirect("/login");
    }
});


app.get("/songs", function (req, res) {
    res.statusCode = 200;

    if (req.isAuthenticated() && req.user[0].user_type === 2) {
        var sql =
            "SELECT song_id, song_name, published_by, length, date_added, number_of_plays FROM track;";

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
    if (req.user[0].user_type !== 1 || !req.isAuthenticated())
        res.redirect('/login');
    const mp3_file = req.files.trackfile;

    const mp3_path = `${__dirname}/music/${mp3_file.name}`;
    await mp3_file.mv(mp3_path);
    const duration_minutes = (
        (await music_metadata.parseFile(mp3_path)).format.duration / 60
    ).toFixed(2);
    const cover_art = req.files.trackart;

    const sql = `INSERT INTO track (song_file, song_name, length, published_by${(cover_art) ? ", cover_art" : ""})
    VALUES ("${route + "music/" + mp3_file.name}", 
            "${req.body.trackname}", 
            ${duration_minutes}, 
            "${req.user[0].username}"
            ${(cover_art) ? `, "${route + "cover_art/" + cover_art.name}"` : ""} 
            );`;
    if (cover_art) {
        const cover_art_path = `${__dirname}/cover_art/${cover_art.name}`;
        cover_art.mv(cover_art_path);
    }


    connection.query(sql, function (error, results) {
        if (error) throw error;
        res.redirect("/musician-tracks");
    });
});


app.post("/plays", (req, _) => {
    const plays = req.body;
    const song_ids = Object.keys(plays);
    song_ids.forEach((key) => {
        connection.query(
            `UPDATE track SET number_of_plays = number_of_plays + ${plays[key]} WHERE song_id = ${key}`,
            (err) => {
                if (err) throw err;
            }
        );
    });
});

//Queries, users, playlists, and notifications
app.post("/runquery", (req, res, next) => {
    let select_type = req.body.selecttype;
    let order_type = req.body.ordertype;

    if (select_type == "user") {
        if (req.body.sorttype == "id") var sort_type = "user_id";
        if (req.body.sorttype == "name") var sort_type = "username";
        if (req.body.sorttype == "date") var sort_type = "date_created";
        var whattoselect = "user_id, username, handle, date_created";
    } else if (select_type == "playlist") {
        if (req.body.sorttype == "id") var sort_type = "playlist_ID";
        if (req.body.sorttype == "name") var sort_type = "playlist_name";
        if (req.body.sorttype == "date") var sort_type = "created_at";
        var whattoselect = "playlist_id, playlist_name, user_username, full_length, created_at";
    } else if (select_type == "notifications") {
        if (req.body.sorttype == "id") var sort_type = "alert_id";
        if (req.body.sorttype == "name") var sort_type = "message";
        if (req.body.sorttype == "date") var sort_type = "date_made";
        var whattoselect = "alert_id, message, attached_user, date_made";
    }

    var sql = `SELECT ${whattoselect} 
    FROM ${select_type} 
    ORDER BY ${sort_type} ${order_type}`;

    var sql1 = `SELECT ${whattoselect}`;
    var sql2 = `FROM ${select_type}`;
    var sql3 = `ORDER BY ${sort_type} ${order_type}`;

    connection.query(`${sql}`, function (error, results) {
        if (error) {
            res.send(error);
            throw error;
        }
        if (results.length <= 0) {
            res.send("<h1>There were no results</h1>");
        }
        else if (select_type == "playlist") {
            res.render("playlist-query", { playlistreport: results, sql1: sql1, sql2: sql2, sql3: sql3 });
        }
        else if (select_type == "user") {
            res.render("user-query", { userreport: results, sql1: sql1, sql2: sql2, sql3: sql3 });
        }
        else if (select_type == "notifications") {
            res.render("notifications-query", { notificationsreport: results, sql1: sql1, sql2: sql2, sql3: sql3 });
        }
    });
});


//Reports: users, top artists, media
app.post("/run-reports", (req, res, next) => {

    var select_report = req.body.report_selection;
    var start_date = req.body.report_start;
    var end_date = req.body.report_end;

    if (select_report == "top_artists") {
        var sql = `SELECT user_id, username, SUM(number_of_plays) AS total_plays
        FROM user, track
        WHERE track.published_by = username AND
        user.date_created BETWEEN '${start_date}' AND '${end_date}'
        GROUP BY username
        ORDER BY total_plays DESC`;

    } else if (select_report == "users") {
        var sql = `SELECT user_type, COUNT(user_id) AS total_users
        FROM user WHERE user_id = user_id AND user_type = user_type 
        AND user.date_created BETWEEN '${start_date}' AND '${end_date}'
        GROUP BY user_type
        ORDER BY total_users`;

    } else if (select_report == "media") {
        var sql = `SELECT COUNT(DISTINCT track.song_file) as total_tracks, SUM(DISTINCT track.length) as total_tracks_length, 
        COUNT(DISTINCT playlist.playlist_ID) as total_playlists, SUM(DISTINCT playlist.full_length) as total_playlists_length
        FROM track, playlist
        WHERE playlist.created_at BETWEEN '${start_date}' AND '${end_date}' 
        AND track.date_added BETWEEN '${start_date}' AND '${end_date}'`;
    }

    connection.query(`${sql}`, function (error, results) {
        if (error) {
            res.send(error);
            throw error;
        }
        if (select_report == "top_artists") {
            res.render("top-artists", { artists_report: results, sql: sql, start_date: start_date, end_date: end_date });
        }
        else if (select_report == "users") {
            res.render("users-report", { users_report: results, sql: sql, start_date: start_date, end_date: end_date });
        }
        else if (select_report == "media") {
            res.render("media-report", { media_report: results, sql: sql, start_date: start_date, end_date: end_date });
        }
    });
});


app.post("/my-playlists", (req, res, next) => {
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
    var playlist_id = req.body.playlist_id;
    var song_id = req.body.song_id;

    let sql = `INSERT INTO contains_tracks
                 (track_song_id, track_published_by, playlist_playlist_ID)
               VALUES ( ${song_id},
                        (SELECT published_by FROM track WHERE song_id=${song_id}),
                       \"${playlist_id}\");`;

    connection.query(sql, function (error, results) {
        var msg = { type: 0, msg: "Successfully added" };

        if (error) {
            if (error.errno != 1062) throw error;

            msg = { type: 1, msg: "Song is already in playlist" };
        }

        req.flash("message", msg);
        res.redirect("/listener");
    });

});

app.post("/delete-playlist", (req, res, next) => {
    var playlist_id = req.body.playlist_id;

    let sql = `DELETE FROM playlist WHERE playlist_ID = \"${playlist_id}\"`;

    connection.query(sql, function (error, results) {
        if (error) throw (error);
    });

    res.redirect("/my-playlists");
});

app.post("/delete-notification", (req, res, next) => {
    var alert_id = req.body.alert_id;

    let sql = `DELETE FROM notifications WHERE alert_id = \"${alert_id}\"`;

    connection.query(sql, function (error, results) {
        if (error) throw (error);
    });

    res.redirect("/queries");
});

app.post("/delete-playlist-admin", (req, res, next) => {
    var playlist_id = req.body.playlist_id;

    let sql = `DELETE FROM playlist WHERE playlist_id = \"${playlist_id}\"`;

    connection.query(sql, function (error, results) {
        if (error) throw error;
    });

    res.redirect("admin-playlist");
});


app.post("/delete-song", (req, res, next) => {
    var song_id = req.body.song_id;

    let sql = `DELETE FROM track WHERE song_id = ${song_id}`;

    connection.query(sql, function (error, results) {
        if (error) throw error;
    });

    res.redirect("/musician-tracks");
});

app.post("/delete-song-admin", (req, res, next) => {
    var song_id = req.body.song_id;

    let sql = `DELETE FROM track WHERE song_id = ${song_id}`;

    connection.query(sql, function (error, results) {
        if (error) throw error;
    });

    res.redirect("songs");
});

app.post("/delete-user", (req, res, next) => {
    var user_id = req.body.user_id;

    let sql = `DELETE FROM user WHERE user_id = ${user_id}`;

    connection.query(sql, function (error, results) {
        if (error) throw error;
    });

    res.redirect("admin");
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
                is_private: 0,
                data: JSON.stringify(results),
                user: req.session.passport.user,
                curr_route: (isProd == 'development') ? devRoute : prodRoute
            });
        });
    } else {
        res.redirect("/login");
    }
});

//admin open playlist
app.post("/admin-open-playlist", function (req, res, next) {
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
            res.render("admin-open-playlist", {
                pl_name: playlist_name,
                pl_creator: playlist_creator,
                pl_id: playlist_id,
                is_private: 0,
                data: JSON.stringify(results),
                user: req.session.passport.user,
                curr_route: (isProd == 'development') ? devRoute : prodRoute
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
        var is_private = req.body.is_private;

        var sql1 = `DELETE FROM contains_tracks
                   WHERE (playlist_playlist_ID = \"${playlist_id}\"
                          && track_song_id = ${song_id});`;

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
                is_private: is_private,
                data: JSON.stringify(results),
                user: req.session.passport.user,
                curr_route: route
            });
        });
    } else {
        res.redirect("/login");
    }
});

app.post("/remove-from-favorites", function (req, res, next) {
    if (req.isAuthenticated()) {
        var song_id = req.body.song_id;
        var playlist_id = req.body.playlist_id;

        var sql1 = `DELETE FROM contains_tracks
                    WHERE (playlist_playlist_ID = \"${playlist_id}\"
                          && track_song_id = ${song_id});`;

        connection.query(sql1, function (error, results, fields) {
            if (error) throw error;

            var msg = { type: 0, msg: "Successfully removed" };
            req.flash("message", msg);
            res.redirect("/listener");
        });

    } else {
        res.redirect("/login");
    }
});

app.post("/edit-playlist", function (req, res, next) {
    if (req.isAuthenticated()) {
        var playlist_id = req.body.playlist_id;
        var playlist_name = req.body.playlist_name;
        var playlist_creator = req.body.playlist_creator;

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
                is_private: 0,
                data: JSON.stringify(results[1]),
                user: req.session.passport.user,
                curr_route: (route)
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
        if (error) throw error;
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
        if (error) throw error;
    });

    res.redirect("songs");
});

app.post("/edit-user", (req, res, next) => {
    var user_id = req.body.user_id;
    var username = req.body.username;
    var user_type = req.body.role;
    var handle = req.body.handle;
    var pass = req.body.pass;

    let sql = `UPDATE user
               SET user_type = \"${user_type}\", handle = \"${handle}\", username = \"${username}\", pass = \"${pass}\"
               WHERE user_id = ${user_id}`;

    connection.query(sql, function (error, results) {
        if (error) throw error;
    });

    res.redirect("admin");
});


//app.get("/user-details", (req, res, next) => {

//     user_id = user.user_id;

//     let sql = `SELECT * FROM user WHERE user_id = ${user_id}`;

//     connection.query(`${sql}`, function (error, results) {
//         if (error) throw error;
//         var user_id;
//         results[0].forEach(function (user) {
//             user_id = user.user_id;
//         });
//     });

//         res.render("admin", {
//             details: results[0]
//         }
//     );
// });



app.post("/create-user", (req, res, next) => {
    var handle = req.body.handle;
    var username = req.body.username;
    var user_type = req.body.user_type;
    var password = req.body.password;

    let sql = `INSERT INTO user
                (handle, username, user_type, pass)
                VALUES (\"${handle}\", \"${username}\", ${parseInt(user_type)}, \"${password}\")`;

    connection.query(sql, function (error, results) {
        if (error) throw error;
    });

    res.redirect("admin");
});

//--------------Server--------------//

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});