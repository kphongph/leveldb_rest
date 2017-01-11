var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var passport = require('passport');
var LocalStrategy = require('passport-localapikey').Strategy;
var session = require('express-session');
var authorization = require('express-authorization');
var path = require('path');
var https = require('https');

var service_interface = require('./routes/service_interface');
var config = require('./config');
var login = require('./login');
var ssl = require('./ssl_option');

var PORT = process.env.PORT || config.port;
var HOST = process.env.HOST || '';

var app = express();

app.use(session({
  secret: config.session_key
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static(path.join(__dirname, 'views')));

passport.use(new LocalStrategy(function(apikey, done) {
  login._isAuthen(apikey, done)
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  //console.log(id);
  login._getUser(id, done);
});

// setup permission middleware
var ensureNounVerb = authorization.ensureRequest
  .onDenied(function(req, res, done) {
    //console.log('done');
    res.json({
      'authroized': false
    });
    //done();
  })
  .isPermitted('noun:verb')

app.post('/login', login._login);
app.post('/logout', login._logout);          

/*
app.use('/api', service_interface);
*/

app.use('/api',passport.authenticate('localapikey', {
  session: true
}), service_interface);

https.createServer(ssl.options, app).listen(PORT, HOST, null, function() {
  console.log('Server listening on port %d', this.address().port);
});