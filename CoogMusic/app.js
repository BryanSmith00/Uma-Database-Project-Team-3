const express = require('express');
const bp = require('body-parser')
var passport = require('passport');
const connection = require('./public/js/database');

var app = express();
const port = 3000;
const session = require('express-session');

//---------------Session stup---------------//

app.set('trust proxy', 1) // trust first proxy

app.use(session({
    secret: "tempsecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
}));

app.use(passport.initialize());
app.use(passport.session());

//Additional middleware 
app.use(express.static(__dirname));
app.use(bp.json())
app.use(bp.urlencoded({ extended: false }))


//---------------Passport---------------//

require('./public/js/passport');

app.use((req, res, next) => {
    //console.log(req.session);
    //console.log(req.user);
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
    res.redirect('/home');
})

//Failed login route
app.get('/login-failure', (req, res, next) =>{
    res.send("Your username or password was incorrect");
})

app.get('/home', (req, res, next) => {
   
    // This is how you check if a user is authenticated
    if (req.isAuthenticated()) {
        res.sendFile(__dirname + '/views/homepage.html');
    } else {
        res.redirect('/login');
    }
});

//POST

//Login page route
//app.post("/login", passport.authenticate('local'), (req, res, next) => {});
app.post('/login', passport.authenticate('local', { failureRedirect: '/login-failure', successRedirect: 'login-success' }), (err, req, res, next) => {
    if (err) res.send(err); next(err);
});


//--------------Server--------------//

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
}); 