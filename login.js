var level = require('level');
var stream = require('stream');
var jwt = require('jsonwebtoken');
var util = require('./util');
var encryption = require('./encryption');
var ssl = require('./ssl_option');
const loginTimeOut = 180;

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

var jwtToken = function(UserID) {
  console.log(UserID);
  // sign with RSA SHA256 
  var cert = ssl.options.key;  // get private key 
  var token = jwt.sign({ UserID: UserID }, cert,{ algorithm: 'RS256' });
  return token;
};

module.exports = {
  _login: function (req, res) {
    var _username = req.body.user?req.body.user:req.headers.user;
    var _pass = req.body.pass?req.body.pass:req.headers.pass;
    findByUsername(_username, function (found, user) {
      if (found) {
        var _password_hash = encryption.password_hash(_pass, user.value.doc.Pass_Salt);
        if (user.value.doc.User === _username && user.value.doc.Pass_Hash === _password_hash) {
          if( ! user.value.doc.deactive ){
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
                  console.log({'username':_username,message:'Authenthicated','last_login':new Date(obj.timestamp)});
                  if (err) {
                    res.json({
                      status: false
                    });
                  } else {
                    res.set({
                      'Content-Type': 'application/json; charset=utf-8',
                      'Authorization': jwtToken(_username)
                    })
                    res.json({
                      status: true,
                      key: key
                    });
                  }
                });
              }
            });
          }else{
            console.log({'username':_username,message:'Username Deactived'});
            res.json({
              status: false,
              message: 'Username Deactived'
            });
          }
        }else{
          console.log({'username':_username,message:'Invalid Username or Password'});
          res.json({
            status: false,
            message:'Invalid Username or Password'
          });
        }
      } else {
        console.log({'username':_username,message:'Username is Not Found'});
        res.json({
          status: false,
          message:'Username is Not Found'
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
