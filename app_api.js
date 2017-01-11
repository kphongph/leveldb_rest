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
var request = require('request');
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

app.post('/upload/:container/:filename?', function(req, res) {
  var apikey = req.query.apikey;
 // console.log('apikey', apikey);
  request({
    method: 'GET',
    uri: 'https://maas.nuqlis.com:9000/getUser/' + apikey + '?apikey=' + apikey,
  }, function(err, httpResponse, body) {
    if (err) {
      res.send({
        'ok': false,
        'message': err
      });
    } else {
      if (body === false) {
        res.send({
          'ok': false,
          'message': err
        });
      } else {
        _upload(req, res);
      }
    }
  });

});

function _upload(req, res) {
  var blobService = azure.createBlobService(config.azure_blob_accountName, config.azure_blob_accessKey);
  var container = req.params.container;

  if (req.headers['content-type'].indexOf('text/plain') !== -1) {
    var body = '';
    req.on('data', function(data) {
      body += data;
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
      res.json({

        'ok': true

      });
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
    res.json({
      'ok': true
    });
  }

}

https.createServer(options, app).listen(PORT, HOST, null, function() {
  console.log('Server listening on port %d', this.address().port);
});