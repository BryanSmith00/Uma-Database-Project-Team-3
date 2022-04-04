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

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    console.log(__dirname);
});


