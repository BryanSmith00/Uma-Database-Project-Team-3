const express = require('express');
var http = require('http');
const bp = require('body-parser')
const app = express();
const port = 3000;

app.use(express.static(__dirname));
app.use(bp.json())
app.use(bp.urlencoded({ extended: false }))

app.get('/', function(request, response) {
    response.statusCode = 200;
    //response.sendFile(__dirname + "/views/index.html");
    response.sendFile(__dirname + "/views/index.html");
});

app.get('/login', function(request, response) {
    response.statusCode = 200;
    console.log(request.body.data)
    response.sendFile(__dirname + "/views/login.html");
});

app.post("/login", (req, res) => {
    console.log(req.body)
    let username = req.body.username;
    let password = req.body.password;
    res.send(`Username: ${username} Password: ${password}`);
    //response.sendFile(__dirname + "/public/php/test.html")
    //postToPHP(request.body.data);
});
app.get('/music', (_, res) =>{
    res.sendFile(__dirname + "/views/music-player.html")
})

function postToPHP (data) {

    var options = {
        host : 'localhost',
        port : 3000,
        path : '/CoogMusic/login.php',
        method : 'POST',
        headers : {
            'Content-Type' : 'application/json',
            'Content-Length' : Buffer.byteLength(data)
        }
    };

    var buffer = "";

    var reqPost = http.request(options, function(res) {
        console.log("statusCode: ", res.statusCode);

        res.on('data', function(d) {
            console.info('POST Result:\n');
            buffer = buffer+data;
            console.info('\n\nPOST completed');

        });

        res.on('end', function() {
            console.log(buffer);
        });
    });

    console.log("before write: "+data);

    reqPost.write(data);
    reqPost.end();

}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    console.log(__dirname);
});
