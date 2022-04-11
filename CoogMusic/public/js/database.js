let mysql = require('mysql');

//Establishes the connection to the mysql server
var connection = mysql.createConnection({
    host: "team-3-3380.cbbxip0p57sn.us-east-2.rds.amazonaws.com",
    user: "admin",
    password: "*ZrYDzw*Puctowy\$nf42",
    database: "coog_music",
    multipleStatements: true
    });

connection.connect(function(err) {
    if (err) throw err;
    else
        console.log("successful connection");

    });

module.exports = connection;

