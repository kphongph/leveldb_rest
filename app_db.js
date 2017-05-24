var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var passport = require('passport');
var LocalStrategy = require('passport-localapikey').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
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

passport.use(new LocalStrategy(function (apikey, done) {
  login._isAuthen(apikey, done)
}));

var pConf =  {
    protocol: "https",
    host: "maas.nuqlis.com:9002",
  };

passport.use(new BearerStrategy(
  function(token, done) {
    console.log(token);
    var request = require('request'),
    options = {
      url: pConf.protocol + '://' + pConf.host + '/api/userinfo',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    };

    function callback(error, response, body) {
      if (!error && response.statusCode === 200) {
          return done(null, body, { scope: 'all' });
      } else {
          return done(null, false);
      }
    }
    request(options, callback);
}
));

var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeader();
jwtOptions.secretOrKey = ssl.options.cert;

passport.use(new JwtStrategy(jwtOptions, function(jwt_payload, done) {
  done(null, jwt_payload);
}));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  login._getUser(id, done);
});

// setup permission middleware
var ensureNounVerb = authorization.ensureRequest
.onDenied(function (req, res, done) {
  //console.log('done');
  res.json({
    'authroized': false
  });
  //done();
})
.isPermitted('noun:verb')

app.post('/login', login._login);
app.post('/logout', login._logout);

var ensureLogin = function(req,res,next) {
  passport.authenticate(['localapikey','bearer','jwt'], function(err,user,info) {
    if(err) { return next(err); }
    if(!user) {
      return res.json({
        'ok':false,
        'message':'Authentication Required'
      });
    } else {
      return next();
    }
  })(req,res,next);
};

app.use('/api', ensureLogin, service_interface);
app.use('/apis', ensureLogin, service_interface);
app.use('/views', require('./routes/views'));

https.createServer(ssl.options, app).listen(PORT, HOST, null, function () {
  console.log('Server listening on port %d', this.address().port);
});
