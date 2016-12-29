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
var multiparty = require('multiparty');
var azure = require('azure');
var Readable = require('stream').Readable;
var login = require('./login');
var config = require('./config');

var PORT = process.env.PORT || 9001;
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

app.get('/img', function(req, res) {
  res.writeHead(200, {
    'content-type': 'text/html'
  });
  res.end(
    '<form action="/upload/databasebackup?apikey=b3ab8110cbfb11e6b935495cf12a55bb" enctype="multipart/form-data" method="post">' +
    '<input type="text" name="title"><br>' +
    '<input type="file" name="upload"><br>' +
    '<input type="submit" value="Upload">' +
    '</form>'
  );
});

app.get('/servertime', function(req, res) {
  var long_date = new Date().getTime()
  res.send(long_date.toString());
});

app.post('/upload/:container/:filename?',
passport.authenticate('localapikey', {
  session: true
}), function(req, res) {
  var blobService = azure.createBlobService(config.azure_blob_accountName, config.azure_blob_accessKey);
  var container = req.params.container;

  if (req.headers['content-type'].indexOf('text/plain') !== -1) {
    var body = '';
    req.on('data', function(data) {
      body = data;
    });
    req.on('end', function() {
      var fileName = req.params.filename;
      var image = new Buffer(body.replace(/^data:image\/\w+;base64,/, ''), 'base64');

      var s = new Readable();
      s.push(image);
      s.push(null);

      blobService.createBlockBlobFromStream(container, fileName, s, image.length, function(error) {
        if (error) {
          res.end(error)
        }
      });
      res.end('OK');
    });
  } else { // request as form action
    var form = new multiparty.Form();
    form.on('part', function(part) {
      if (!part.filename) return;
      var size = part.byteCount;
      var name = part.filename;
      blobService.createBlockBlobFromStream(container, name, part, size, function(error) {
        if (error) {
          res.end(error)
        }
      });
    });
    form.parse(req);
    res.end('OK');
  }

});

https.createServer(options, app).listen(PORT, HOST, null, function() {
  console.log('Server listening on port %d', this.address().port);
});
