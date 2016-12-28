var crypto = require('crypto');
var util = require('./util');
const loginTimeOut = 30;

module.exports = {
  _login: function(req, res) {

    var pass = crypto.createHmac('sha256', 'inf@rva+')
      .update(req.body.user + req.body.pass + 'inf@rva+')
      .digest('hex');

    var key = req.body.user + ':' + pass;
    console.log(key);

    util.get_dbs('user_index_db', function(err, user_index_db) {
      if (err) {
        res.json({
          'ok': false,
          'message': err
        });
      } else {
        user_index_db.get(key, function(err, value) {
          if (err) {
            res.json({
              status: false,
              message: 'Invalid Username & password'
            });
          } else {
            key = value;
            var obj = {
              timestamp: new Date(),
              key: key
            };

            util.get_dbs('authen_db', function(err, authen_db) {
              if (err) {
                res.json({
                  'ok': false,
                  'message': err
                });
              } else {
                authen_db.put(key, obj, function(err) {
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
        });
      }
    });
  },
  _logout: function(req, res) {
    util.get_dbs('authen_db', function(err, authen_db) {
      if (err) {
        res.json({
          'ok': false,
          'message': err
        });
      } else {
        authen_db.del(req.body.key, function(err) {
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
  _getUser: function(key, done) {
    util.get_dbs('user_db', function(err, user_db) {
      if (err) {
        res.json({
          'ok': false,
          'message': err
        });
      } else {
        user_db.get(key, function(err, value) {
          if (err) {
            done(null, false);
          } else {
            value.id = key;
            value.permissions = ['noun:*'];
            done(null, value)
          }
        });
      }
    });
  },
  _isAuthen: function(apikey, done) {
    util.get_dbs('authen_db', function(err, authen_db) {
      if (err) {
        res.json({
          'ok': false,
          'message': err
        });
      } else {
        authen_db.get(apikey, function(err, value) {
          if (err) {
            done(null, false);
          } else {
            var diff = Math.abs(new Date(value.timestamp) - new Date());
            var minutes = Math.floor((diff / 1000) / 60);

            if (minutes > loginTimeOut) {
              done(null, false);
            } else {
              var key = value.key;

              util.get_dbs('user_db', function(err, user_db) {
                if (err) {
                  res.json({
                    'ok': false,
                    'message': err
                  });
                } else {
                  user_db.get(apikey, function(err, value) {
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
  },
  _getUser_authen: function(req, res) {
    var key = req.params.key;
    _getUser(key, function(err, value) {
      if (err) {
        res.json({
          'ok': false
        });
      } else {
        res.json(value);
      }
    });
  }
}
