var express = require('express');
var router = express.Router();
var request = require('request');

var redirect = function(method,url,req,res) {
  if(req.body) {
    request({
      method:method,
      url:url,
      json:true,
      body:req.body
    }).pipe(res);
  } else {
      request({
      method:method,
      url:url,
    }).pipe(res);
  }
}

router.post('/attendance/total', function(req, res) {
  var url = 'http://45.76.176.189:3000/api/query/attendance_summary';
  redirect('POST',url,req,res);
});

router.post('/attendance/student', function(req, res) {
  var url = 'http://45.76.176.189:3000/api/query/attendance_individual';
  redirect('POST',url,req,res);
});

router.post('/indicator/gpa', function(req, res) {
  var url = 'http://45.76.176.189:3000/api/query/student_GPA';
module.exports = router;
  redirect('POST',url,req,res);
});

router.post('/indicator/gpax', function(req, res) {
  var url = 'http://45.76.176.189:3000/api/query/student_GPAX';
  redirect('POST',url,req,res);
});

router.post('/indicator/student_fail', function(req, res) {
  var url = 'http://45.76.176.189:3000/api/query/student_fail';
  redirect('POST',url,req,res);
});

module.exports = router;