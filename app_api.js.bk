var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var path = require('path');
var fs = require('fs');
var cors = require('cors');
var multiparty = require('multiparty');
var azure = require('azure');
var Readable = require('stream').Readable;
var request = require('request');
var config = require('./config');
var adminuser = require('./adminuser');
var hostsummary = require('./hostsummary');
var ssl = require('./ssl_option');
var forever_log = require('./routes/forever_log');

var PORT = process.env.PORT || 9001;
var HOST = process.env.HOST || '';

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/img', function (req, res) {
  res.writeHead(200, {
    'content-type': 'text/html'
  });
  res.end(
    '<form action="/upload/databasebackup?apikey=83969040dd9f11e6bc01774977b2f887" enctype="multipart/form-data" method="post">' +
    '<input type="text" name="title"><br>' +
    '<input type="file" name="upload"><br>' +
    '<input type="submit" value="Upload">' +
    '</form>'
  );
});
app.get('/servertime', function (req, res) {
  var long_date = new Date().getTime()
  res.send(long_date.toString());
});

app.get('/forever', forever_log);

app.post('/user', adminuser._user);
app.post('/resetpass', adminuser._resetpass);
app.post('/edituser', adminuser._edituser);

app.post('/changepass', adminuser._changepass);
app.post('/studentstatus', hostsummary._studentstatus);
app.post('/dbs/form_record/:id?', hostsummary._formrecord);
app.post('/upload/:container/:filename?', function (req, res) {
  var apikey = req.query.apikey;
  var uri = 'https://maas.nuqlis.com:9000/api/dbs/user_db/' + apikey + '?apikey=' + apikey;
  //console.log('apikey : ', apikey,'\n uri : ',uri);
  request({
    method: 'GET',
    json: true,
    uri: uri,
  }, function (err, httpResponse, body) {
    //console.log('\n--body--\n',body);
    if (err) {
      //console.log('\n--if--\n',err);
      res.send({
        'ok': false,
        'message': err
      });
    } else {
      //console.log('\n--else--\n',err);
      if (body === false || body === 'Unauthorized') {
        res.send({
          'ok': false,
          'message': err
        });
      } else {
        //console.log('body.id : ', body.id,'\napikey : ',apikey);
        if (body.id === apikey) {
          _upload(req, res);
        } else {
          res.send({
            'ok': false,
            'message': err
          });
        }
      }
    }
  });

});

var _upload = function (req, res) {
  var blobService = azure.createBlobService(config.azure_blob_accountName, config.azure_blob_accessKey);
  var container = req.params.container;

  if (req.headers['content-type'].indexOf('text/plain') !== -1) {
    var body = '';
    req.on('data', function (data) {
      body += data;
    });
    req.on('end', function () {
      var fileName = req.params.filename;
      var image = new Buffer(body.replace(/^data:image\/\w+;base64,/, ''), 'base64');

      var s = new Readable();
      s.push(image);
      s.push(null);

      blobService.createBlockBlobFromStream(container, fileName, s, image.length, function (error) {
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
    form.on('part', function (part) {
      if (!part.filename) return;
      var size = part.byteCount;
      var name = part.filename;
      blobService.createBlockBlobFromStream(container, name, part, size, function (error) {
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
};

https.createServer(ssl.options, app).listen(PORT, HOST, null, function () {
  console.log('Server listening on port %d', this.address().port);
});
