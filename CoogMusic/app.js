const express = require('express');
var http = require('http');
const bp = require('body-parser')
var mysql = require('mysql');
const app = express();
const port = 3000;

app.use(express.static(__dirname));
app.use(bp.json())
app.use(bp.urlencoded({ extended: false }))

app.get('/', function(request, response) {
    response.statusCode = 200;
    response.sendFile(__dirname + "/views/index.html");
});

app.get('/login', function(request, response) {
    response.statusCode = 200;
    response.sendFile(__dirname + "/views/login.html");
});

app.post("/login", (req, res) => {
    console.log(req.body)
    let username = req.body.username;
    let password = req.body.password;
    res.send(`Username: ${username} Password: ${password}`);

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
    
    connection.query('SELECT * FROM user', function (error, results, fields) {
        if (error) throw error;
        //console.log('The solution is: ', results[0].solution);
        console.log(results);
        console.log(typeof results);
      });
});

function postToPHP (data) {

    var options = {
        host : 'localhost',
        port : 3000,
        path : '/CoogMusic/public/php/login.php',
        method : 'POST',
        headers : {
            'Content-Type' : 'text/plain',
        }
    };

    //var buffer = "";

    var reqPost = http.request(options, function(res) {
        console.log("statusCode: ", res.statusCode);

        /*res.on('data', function(d) {
            console.info('POST Result:\n');
            //buffer = buffer+data;
            console.info('\n\nPOST completed');

        });*/
        /*
        res.on('end', function() {
            console.log(buffer);
        });*/
    });

    //console.log("before write: "+data);

    reqPost.write(data);
    reqPost.end();

}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    console.log(__dirname);
});
