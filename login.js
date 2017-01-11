var level = require('level');
var stream = require('stream');
var crypto = require('crypto');
var util = require('./util');
const loginTimeOut = 30;

var getuser = function (username, cb) {
  //console.log('\n---getuser function---\n',username);
  util.get_dbs('user_db', function (err, db) {
    //console.log('\n---database name---\n',db);
    var found = false;
    var _index = db.indexes['user'];
    //console.log('\n---check index---\n', _index);
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

module.exports = {
  _login: function (req, res) {
    var _username = req.body.user;
    var _pass = req.body.pass;
    getuser(_username, function (found, user) {
      //console.log('\n---found---\n',found,'\n---user---\n',user);    
      if (found) {
        var pass = crypto.createHmac('sha256', 'inf@rva+')
          .update(_username + _pass + 'inf@rva+')
          .digest('hex');
        //console.log('\n',user.value.doc.User,' : ',user.value.doc.Pass);
        //console.log('\n',_username,' : ',pass);
        if (user.value.doc.User === _username && user.value.doc.Pass === pass) {
          //console.log('\n---found---\n', found, '\n---user---\n', user);
          var key = user.value.key;
          var obj = {
            timestamp: new Date(),
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
                //console.log('\n---authen_db---\n', key, ' : ', obj);
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
  _isAuthen: function (apikey, done) {
    util.get_dbs('authen_db', function (err, authen_db) {
      if (err) {
        res.json({
          'ok': false,
          'message': err
        });
      } else {
        authen_db.get(apikey, function (err, value) {
          if (err) {
            done(null, false);
          } else {
            var diff = Math.abs(new Date(value.timestamp) - new Date());
            var minutes = Math.floor((diff / 1000) / 60);

            if (minutes > loginTimeOut) {
              done(null, false);
            } else {
              var key = value.key;

              util.get_dbs('user_db', function (err, user_db) {
                if (err) {
                  res.json({
                    'ok': false,
                    'message': err
                  });
                } else {
                  user_db.get(apikey, function (err, value) {
                    if (err) {
                      done(null, false);
                    } else {
                      value.id = key;
                      value.permissions = ['noun:*'];
                      done(null, value);
                    }
                  });
                }
              });
            }
          }
        });
      }
    });
  }
}
