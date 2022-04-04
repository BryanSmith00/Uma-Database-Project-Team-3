const express = require('express');
const session = require('express-session');
const bp = require('body-parser')
var passport = require('passport');
const connection = require('./public/js/database');

var app = express();
const port = 3000;

app.use(express.static(__dirname));
app.use(bp.json())
app.use(bp.urlencoded({ extended: false }))

//---------------Session stup---------------//

app.use(session({
    secret: "tempsecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 365 * 60 * 60 * 24 // 1 year
    }
}));


//---------------Passport---------------//

require('./public/js/passport');

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    console.log(req.session);
    console.log(req.user);
    next();
});

//--------------Routes--------------//
//GET

//Landing page route
app.get('/', function(req, res, next) {
    res.statusCode = 200;
    res.sendFile(__dirname + "/views/index.html");
});

//Login page route
app.get('/login', function(req, res, next) {
    res.statusCode = 200;
    res.sendFile(__dirname + "/views/login.html");
});

//Sign up page route
app.get('/signup', function(req, res, next) {
    res.statusCode = 200;
    res.sendFile(__dirname + "/views/signup.html");
});

//Music player route
app.get('/music', (req, res, next) =>{
    res.sendFile(__dirname + "/views/music-player.html");
})

//Good login route
app.get('/login-success', (req, res, next) =>{
    res.send('<h1>success</h1>');
    next();
})

//Failed login route
app.get('/login-fail', (req, res, next) =>{
    res.send("Your username or password was incorrect");
    next();
})


//POST

//Login page route
//app.post("/login", passport.authenticate('local'), (req, res, next) => {});
app.post('/login', passport.authenticate('local', { failureRedirect: '/login-fail', successRedirect: '/login-success' }));


//--------------Server--------------//

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
}); 