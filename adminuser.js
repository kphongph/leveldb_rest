var crypto = require('crypto');
var request = require('request');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
var mail = require('./mail');
var mailtemplate = require('./mailtemplate');
var request_core = require('./request_core');
var encryption = require('./encryption');

var login_endpoint = 'https://maas.nuqlis.com:9000/api/dbs/user_db/';

module.exports = {
  _user: function (req, res) {

    var obj = req.body.data;
    var str = uuid.v1();
    var _key = str.replace(/-/g, '');

    obj.id = _key;
    var pass_salt = encryption.password_salt(obj.Pass);
    var pass_hash = encryption.password_hash(obj.Pass, pass_salt);

    obj.Pass_Salt = pass_salt;
    obj.Pass_Hash = pass_hash
    delete obj.Pass;

    var uri = login_endpoint + _key + '?apikey=' + req.body.key;

    request_core.post_request(uri, obj, function (err, data) {
      if (err) {
        res.json(data);
      } else {
        if (data.ok === false || data === 'Unauthorized') {
          res.json(data);
        }else{
          res.json(data);
        }
      }
    });
  },
  _resetpass: function (req, res) {

    var obj = req.body.data;
    var apiKey = req.body.key;
    var passtmp = encryption.random6charactor();

    var pass_salt = encryption.password_salt(passtmp);
    var pass_hash = encryption.password_hash(passtmp, pass_salt);

    obj.Pass_Salt = pass_salt;
    obj.Pass_Hash = pass_hash
    console.log('--reset password--\n','Username : ',obj.User,'Password : ',passtmp);
    var uri = login_endpoint + obj.id + '?apikey=' + apiKey;
    request_core.post_request(uri, obj, function (err, data) {
      if (err) {
        res.json(data);
      } else {
        if (data.ok === false || data === 'Unauthorized') {
          res.json(data);
        } else {
          var sendMailObj = {
            from_email: { email: 'cct.nuteam@gmail.com', name: 'ระบบคัดกรองนักเรียนยากจน' },
            to_email: { email: obj.Email, name: obj.Title + obj.Firstname + ' ' + obj.Lastname },
            subject: 'แจ้งรหัสผ่านใหม่ระบบคัดกรองนักเรียนยากจน',
            content: mailtemplate._resetpassmail(obj.Firstname + ' ' + obj.Lastname, obj.User, passtmp),
            content_type: 'text/html'
          };

          mail._sendmail(sendMailObj, function (mailres) {
            res.json(mailres);
          });
        }
      }
    });
  },
  _edituser: function (req, res) {
    var obj = req.body.data;
    var uri = login_endpoint + obj.id + '?apikey=' + req.body.key;
    request_core.post_request(uri, obj, function (err, data) {
      if (err) {
        res.json(data);
      } else {
        if (data.ok === false || data === 'Unauthorized') {
          res.json(data);
        } else {
          res.json(data);
        }
      }
    });
  },
  _changepass: function (req, res) {
    var obj = req.body.data;
    var pass_salt = encryption.password_salt(obj.Pass);
    var pass_hash = encryption.password_hash(obj.Pass, pass_salt);
    obj.Pass_Salt = pass_salt;
    obj.Pass_Hash = pass_hash
    delete obj.Pass;

    var uri = login_endpoint + obj.id + '?apikey=' + req.body.key;
    request_core.post_request(uri, obj, function (err, data) {
      if (err) {
        res.json(data);
      } else {
        if (data.ok === false || data === 'Unauthorized') {
          res.json(data);
        }else{
          res.json(data);
        }
      }
    });
  }
}
