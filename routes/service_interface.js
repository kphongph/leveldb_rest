var express = require('express');
var request = require('request');
var router = express.Router();
var controller = require('./service_controller');
var config = require('../config');
var views = require('./views');
var pipe_request = function(method, url, req, res) {
var jwt = 'JWT eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySUQiOiJCb21iIiwiaWF0IjoxNDg5MDM0MTE0fQ.fv0r1vZ9B-i_AG1ogGdvumNDpnE1eowmhETO-Lqrjpyyz884_p423mH6cn-KVaZFhy9Z9Gs-0zljg6d3KUhKhDJzomJspgHiaMzrnqVs838IviD4ig-oFcSgkqCKn6aXULXoLnpb6ueKshvdHX3NIxlNPd_oPCEDOEg8ufPAnLgb78OHcwwKK_YmB7zidrs-7Ltx93lJJSF0-FO_kd3i_H4Z3vKOtKtoAnSdWQqPr2EVilxzHQwyiKrLUnzIGz6Iv3yS2qIDp8OCXVopSRwM0bnESC0tClF-7EO6J0d1NDxamuX6XHKvuujSaoynMTFtICSY0ojUYRYDDESLvXvLzg';
//var jwt = req.headers.authorization;
  if (req.body) {
    request({
        method: method,
        url: url,
        headers: {
          'Authorization': jwt
        },
        qs: req.query,
        json: true,
        body: req.body
      })
      .on('error', function(err) {
        res.json({
          'ok': false,
          'message': err
        });
      })
      .pipe(res)
  } else {
    request({
      method: method,
      url: url,
    }).pipe(res);
  }
}

router.param('db', function(req, res, next, db) {
  var list_db_proxy = [
    'attendance',
    'newindicator',
    'user_demo',
    'dmc59_1',
    'desirecharacteristicdata',
    'activity',
    'weightheight',
    'hostattendsummary',
    'students_care',
    'healthcare',
    'admin_area',
    'admin_school',
    'teacher67p',
    'knowledgestructure',
    'readthinkwritedata',
    'announcement',
    'examratio',
    'hostconfig',
    'oosc_province',
    'oosc_city',
    'role_db',
    'teacher_db',
    'form_record_new',
    'obec_grade',
    'oosc_tumbon',
    'oosc_village',
    'oosc_child',
    'oosc_form',
    'oosc_assignment',
    'school_db',
    'KpiData59_1MPerArea',
    'KpiData59_1MPerProvince',
    'KpiData59_1PPerArea',
    'KpiData59_1PPerProvince',
    'form_record',
    'obec_students',
    'earlywarning',
    'edu_students',
    'form_template',
    'hostsummary',
    'hostsystem',
    'morning',
    'morningdetail',
    'obec_teacher',
    'school',
    'studentattend',
    'form_record_homevisit',
    'obec_students_old',
    'obecStudents',
    'studentsProfile',
    'studentsAddress',
    'parentsProfile',
    'parentsAddress',
    'hostsummarydetail',
    'hostclassroom',
    'dmc_yakjon601',
    'classteacher',
    'pp5summary',
    'pp5summarynotification'
  ];

  var oosc_db_list = [
    'oosc_assignment',
    'oosc_child',
    'oosc_city',
    'oosc_form',
    'oosc_province',
    'oosc_tumbon',
    'oosc_village'
  ];

  var server_proxy = 'http://localhost:44300';
  if(list_db_proxy.indexOf(req.params.db) != -1) {
    if(oosc_db_list.indexOf(req.params.db) != -1) {
      server_proxy = 'http://thaioosc.org:44300';
    }/*else{
      if(req.params.db == 'obec_students'){
        server_proxy = 'http://thaieduforall.org:44300';
      }
    }*/
    var db_url = server_proxy + req.url;
    pipe_request(req.method, db_url, req, res);
  } else {
    next();
  }
});

router.use('/index/:db', function (req, res) {
 if(req.params.db){
   var list = config.index;
   var obj = {};
   obj.name = req.params.db;
   obj.index = list[req.params.db].attributes;
   res.json(obj);
 }else{
   res.json(config.index);
 }
});

//GET METHOD
router.get('/dbs', controller._listdbs);
router.get('/dbs/:db/:id?', controller._getdata);
router.get('/log/:db', controller._log);
router.get('/compactlog/:db',controller._compact);
router.get('/close/:db', controller._closedb);

//PUT METHOD
router.put('/dbs/:dbs', controller._createdb);

//POST METHOD
router.post('/dbs/:db/:id?', controller._putdata);
router.post('/query/:db/:index',controller._query);

//DELETE METHOD
router.delete('/dbs/:db/:id', controller._daletedata);
//router.delete('/dbs/:dbs', controller._daletedb);

module.exports = router;
