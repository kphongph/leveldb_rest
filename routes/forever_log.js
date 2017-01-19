var express = require('express');
var path = require('path');
var fs = require('fs');
var router = express.Router();

var forever_dir = path.join(process.env.HOME, '.forever');

router.get('/log/:file', function (req, res) {
  var _file = path.join(forever_dir, req.params.file + '.log');
  fs.readFile(_file, function (err, data) {
    if (!err) {
      str = "<html><body><pre>" + data.toString() + "</pre></body></html>";
      res.send(str);
    } else res.send(err);
  });
});

module.exports = router;
