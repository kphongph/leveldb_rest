var crypto = require('crypto');
var request = require('request');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
var mail = require('./mail');
var mailtemplate = require('./mailtemplate');
var request_core = require('./request_core');
var encryption = require('./encryption');

var login_endpoint = 'https://maas.nuqlis.com:9000/api/dbs/';

module.exports = {
  _user: function (req, res) {

/*EXAMPLE
{
  "user": "U110195_008",
  "pass": "P110195_008",
  "application": "cct",
  "profile": {
    "staffid": "110195_008",
    "title": "นางสาว",
    "firstname": "พัชรวดี",
    "lastname": "แพวงศ์จีน",
    "email": "rakwong.z@gmail.com",
    "tel": "0918721032",
    "hostid": "1086110195",
    "hostname": "วัดบรรพตวารีเขต",
    "areaid": "86020000",
    "areaname": "สพป.ชุมพร เขต 2",
    "semester": 1,
    "year": 2017
  },
  "roles": [
    "Teacher"
  ]
}
*/
    var role_db = req.body;
    var str = uuid.v1();
    var _key = str.replace(/-/g, '');
    var pass_salt = encryption.password_salt(role_db.pass);
    var pass_hash = encryption.password_hash(role_db.pass, pass_salt);

    var user_db = {};
    user_db.id = _key;
    user_db.User = role_db.user;
    user_db.Pass_Salt = pass_salt;
    user_db.Pass_Hash = pass_hash

    role_db.profile._id = _key;
    delete role_db.pass;
    var uri_user_db = login_endpoint +'user_db/'+ _key;
    var headers = {'Authorization':req.headers.authorization};
    request_core.post_request(uri_user_db, user_db ,headers, function (err, data) {
      if (err) {
        res.json(data);
      } else {
        if (data.ok === false || data === 'Unauthorized') {
          res.json(data);
        }else{
          var uri_role_db = login_endpoint +'role_db/'+ _key;
          request_core.post_request(uri_role_db, role_db ,headers, function (err, data) {
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
    });
  },
  _resetpass: function (req, res) {

/*EXAMPLE
  {
    "user": "110195_008",
    "application": "cct",
    "profile": {
      "_id": "00047c3002f011e7bdddf9ed08992430",
      "staffid": "110195_008",
      "title": "นางสาว",
      "firstname": "พัชรวดี",
      "lastname": "แพวงศ์จีน",
      "email": "rakwong.z@gmail.com",
      "tel": "0918721032",
      "hostid": "1086110195",
      "hostname": "วัดบรรพตวารีเขต",
      "areaid": "86020000",
      "areaname": "สพป.ชุมพร เขต 2",
      "semester": 1,
      "year": 2017
    },
    "roles": [
      "Teacher"
    ]
  }
  */


    var obj = req.body;
    var headers = {'Authorization':req.headers.authorization};
    var passtmp = encryption.random6charactor();

    var pass_salt = encryption.password_salt(passtmp);
    var pass_hash = encryption.password_hash(passtmp, pass_salt);

    var user_db = {};
    user_db.id = obj.profile._id;
    user_db.User = obj.user;
    user_db.Pass_Salt = pass_salt;
    user_db.Pass_Hash = pass_hash

    console.log('--reset password--\n','Username : ',obj.user,'Password : ',passtmp);
    var uri = login_endpoint +'user_db/'+ obj.profile._id;
    request_core.post_request(uri, user_db,headers, function (err, data) {
      if (err) {
        res.json(data);
      } else {
        if (data.ok === false || data === 'Unauthorized') {
          res.json(data);
        } else {
          var sendMailObj = {
            from_email: { email: 'cct.nuteam@gmail.com', name: 'ระบบสารสนเทศปัจจัยพื้นฐานนักเรียนยากจน' },
            to_email: { email: obj.profile.email, name: obj.profile.title + obj.profile.firstname + ' ' + obj.profile.lastname },
            subject: 'แจ้งรหัสผ่านใหม่ระบบคัดกรองนักเรียนยากจน',
            content: mailtemplate._resetpassmail(obj.profile.firstname + ' ' + obj.profile.lastname, obj.user, passtmp),
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

  /*EXAMPLE
  {
    "user": "110195_008",
    "application": "cct",
    "profile": {
      "_id": "00047c3002f011e7bdddf9ed08992430",
      "staffid": "110195_008",
      "title": "นางสาว",
      "firstname": "พัชรวดี",
      "lastname": "แพวงศ์จีน",
      "email": "rakwong.z@gmail.com",
      "tel": "0918721032",
      "hostid": "1086110195",
      "hostname": "วัดบรรพตวารีเขต",
      "areaid": "86020000",
      "areaname": "สพป.ชุมพร เขต 2",
      "semester": 1,
      "year": 2017
    },
    "roles": [
      "Teacher"
    ]
  }
  */

    var obj = req.body;
    var uri = login_endpoint+'role_db/' + obj.profile._id;
    var headers = {'Authorization':req.headers.authorization};
    request_core.post_request(uri, obj,headers, function (err, data) {
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

  /*EXAMPLE
  {
    "id": "00004320349811e7a8020beecd9b0ad0",
    "user": "U320103010006",
    "pass": "P320103010006"
  }
  */

    var user_db = req.body;
    var headers = {'Authorization':req.headers.authorization};
    var pass_salt = encryption.password_salt(user_db.pass);
    var pass_hash = encryption.password_hash(user_db.pass, pass_salt);

    user_db.id = user_db.id;
    user_db.User = user_db.user;
    user_db.Pass_Salt = pass_salt;
    user_db.Pass_Hash = pass_hash

    var uri = login_endpoint+'user_db/' + user_db.id;
    request_core.post_request(uri, user_db ,headers, function (err, data) {
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
