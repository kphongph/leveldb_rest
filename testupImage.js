var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var cors = require('cors');
var session = require('express-session');
var request = require('request');
var passport = require('passport');
var authorization = require('express-authorization');
var path = require('path');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var fs = require('fs');
var multiparty = require('multiparty');
var azure = require('azure');
var Readable = require('stream').Readable;
var base64 = require('base64-stream');
var config = require('./config');
var adminuser = require('./adminuser');
var hostsummary = require('./hostsummary');
var ssl = require('./ssl_option');
var forever_log = require('./routes/forever_log');

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
  } else {
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
