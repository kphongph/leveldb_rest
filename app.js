var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var passport = require('passport');
var LocalStrategy = require('passport-localapikey').Strategy;
var session = require('express-session');
var authorization = require('express-authorization');
var https = require('https');
var path = require('path');
var fs = require('fs');

var config = require('./config');
var service_interface = require('./routes/service_interface');


var PORT = process.env.PORT || 8083;
var HOST = process.env.HOST || '';

var app = express();


app.use(session({secret: config.session_key})); 
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static(path.join(__dirname, 'views')));

passport.use(new LocalStrategy(function(apikey, cb) {
  if (apikey == config.apikey) {
    cb(null, {
      'Name': 'Theerawut Thaweephattharawong',
      'Username': 'test',
      'id': 1,
      'permissions': ['noun:*']
    });
  } else {
    cb(null, false);
  }
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  done(null, {
    'Name': 'Theerawut Thaweephattharawong',
    'Username': 'test'
  });
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

var options = {
  key  : fs.readFileSync('./ssl_certificate/key.pem'),
  ca   : fs.readFileSync('./ssl_certificate/csr.pem'),
  cert : fs.readFileSync('./ssl_certificate/cert.pem')
}

app.use('/api', passport.authenticate('localapikey', {
  session: true
}), service_interface);

/*
https.createServer(options, app).listen(PORT, HOST, null, function() {
    console.log('Server listening on port %d', this.address().port);
});
*/

app.listen(PORT, function() {
  console.log('Server listening on port %d', this.address().port);
});
