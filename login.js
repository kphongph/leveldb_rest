var level = require('level');
var stream = require('stream');
var crypto = require('crypto');
var util = require('./util');
const loginTimeOut = 30;

var findByUsername = function (username, cb) {
  util.get_dbs('user_db', function (err, db) {
    var found = false;
    var _index = db.indexes['user'];
    if (_index)
      var stream = _index.createIndexStream({
        "start": [username, null],
        "end": [username, undefined],
        "limit": 1,
        "include_doc": true
      });
    stream.on('data', function (data) {
      found = true;
      cb(found, data);
    });
    stream.on('end', function (data) {
      if (!found) cb(found, null);
    });
  });
}

var findByID = function (id, done) {
  util.get_dbs('user_db', function (err, db_name) {
    if (err) {
      res.json({
        'ok': false,
        'message': err
      });
    } else {
      db_name.get(id, function (err, value) {
        if (err) {
          done(null, false);
        } else {
          done(null, value)
        }
      });
    }
  });
};

var password_hash = function (pass, salt) {
  var bytes = new Buffer(pass || '', 'utf16le');
  var src = new Buffer(salt || '', 'base64');
  var dst = new Buffer(src.length + bytes.length);
  src.copy(dst, 0, 0, src.length);
  bytes.copy(dst, src.length, 0, bytes.length);
  return crypto.createHash('sha1').update(dst).digest('base64');
};

module.exports = {
  _login: function (req, res) {
    var _username = req.body.user;
    var _pass = req.body.pass;
    findByUsername(_username, function (found, user) {
      if (found) {
        var _password_hash = password_hash(_pass,user.value.doc.Pass_Salt);
        if (user.value.doc.User === _username && user.value.doc.Pass_Hash === _password_hash) {
          var key = user.value.key;
          var obj = {
            timestamp: new Date().getTime(),
            key: key
          };
          util.get_dbs('authen_db', function (err, authen_db) {
            if (err) {
              res.json({
                'ok': false,
                'message': err
              });
            } else {
              authen_db.put(key, obj, function (err) {
                console.log('\n---authen_db---\n', _username, ' : ', new Date(obj.timestamp));
                if (err) {
                  res.json({
                    status: false
                  });
                } else {
                  res.json({
                    status: true,
                    key: key
                  });
                }
              });
            }
          });
        }
      } else {
        console.log('Not Found');
        res.json({
          status: false
        });
      }
    });
  },
  _logout: function (req, res) {
    util.get_dbs('authen_db', function (err, authen_db) {
      if (err) {
        res.json({
          'ok': false,
          'message': err
        });
      } else {
        authen_db.del(req.body.key, function (err) {
          if (err) {
            res.json({
              status: false
            });
          } else {
            res.json({
              status: true
            });
          }
        });
      }
    });
  },
  _getUser: function (id, done) {
    findByID(id, function (err, value) {
      if (err) {
        done(null, false);
      } else {
        done(null, value)
      }
    });
  },
  _isAuthen: function (id, done) {
    util.get_dbs('authen_db', function (err, authen_db) {
      if (err) {
        res.json({
          'ok': false,
          'message': err
        });
      } else {
        authen_db.get(id, function (err, value) {
          if (err) {
            done(null, false);
          } else {

            var diff = Math.abs(new Date(value.timestamp) - new Date().getTime());
            var minutes = Math.floor((diff / 1000) / 60);

            if (minutes > loginTimeOut) {
              done(null, false);
            } else {
              findByID(id, function (err, value) {
                if (err) {
                  done(null, false);
                } else {
                  done(null, value)
                }
              });
            }
          }
        });
      }
    });
  }
}
