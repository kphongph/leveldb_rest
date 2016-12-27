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
 
var certsPath = path.join(__dirname, 'ssl', 'server'); 
var caCertsPath = path.join(__dirname, 'ssl', 'ca'); 
 
/*---ssl certificate---*/ 
options = { 
  key: fs.readFileSync(path.join(certsPath, 'server.key')) 
, cert: fs.readFileSync(path.join(certsPath, 'server.crt')) 
, ca: [ 
  fs.readFileSync(path.join(caCertsPath, 'ca.crt')) 
// ,fs.readFileSync(path.join(caCertsPath, 'root.crt.pem')) 
] 
, requestCert: false 
, rejectUnauthorized: true 
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
 
/* 
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
*/ 
 
app.get('/img', function(req, res) { 
    res.writeHead(200, {'content-type': 'text/html'}); 
    res.end( 
      '<form action="../api/upload/homevisit?apikey=test12345" enctype="multipart/form-data" method="post">'+ 
      '<input type="text" name="title"><br>'+ 
      '<input type="file" name="upload"><br>'+ 
      '<input type="submit" value="Upload">'+ 
      '</form>' 
    ); 
}); 
 
app.post('/login', login._login); 
app.post('/logout', login._logout); 
 
/*
app.use('/api', passport.authenticate('localapikey', { 
  session: true 
}), service_interface); 
*/
app.use('/api', service_interface);
 
 
https.createServer(options,app).listen(PORT, HOST, null, function() { 
    console.log('Server listening on port %d', this.address().port); 
}); 
 
/* 
app.listen(PORT, function() { 
  console.log('Server listening on port %d', this.address().port); 
}); 
*/ 
