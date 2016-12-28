var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
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
    '<form action="/upload/databasebackup?apikey=dc6604a0caba11e690c84b1a15c779ac" enctype="multipart/form-data" method="post">' +
    '<input type="text" name="title"><br>' +
    '<input type="file" name="upload"><br>' +
    '<input type="submit" value="Upload">' +
    '</form>'
  );
});

app.post('/upload/:container/:filename?', function(req, res) {
  //var isAuthen = login._isAuthen(apikey, done);	
  var blobService = azure.createBlobService(config.azure_blob_accountName, config.azure_blob_accessKey);
  var container = req.params.container;

  // request as base64 image ex. image.jpg;;data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...
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
