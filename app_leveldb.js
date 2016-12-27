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
var login = require('./login');

var PORT = process.env.PORT || 9000;
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

var certsPath = path.join(__dirname, 'ssl_certificate', 'server');
var caCertsPath = path.join(__dirname, 'ssl_certificate', 'ca');

/*---ssl certificate---*/
options = {
  key: fs.readFileSync(path.join(certsPath, 'my-server.key.pem')),
  cert: fs.readFileSync(path.join(certsPath, 'server-name.crt.pem')),
  ca: [
    fs.readFileSync(path.join(caCertsPath, 'ca-name.crt.pem'))
    // ,fs.readFileSync(path.join(caCertsPath, 'root.crt.pem'))
  ],
  requestCert: false,
  rejectUnauthorized: true
};
/*---ssl certificate---*/

passport.use(new LocalStrategy(function(apikey, done) {
  login._isAuthen(apikey, done)
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
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
app.get('/getUser/:key?', login._getUser_authen);

app.use('/api', service_interface);


https.createServer(options, app).listen(PORT, HOST, null, function() {
  console.log('Server listening on port %d', this.address().port);
});
