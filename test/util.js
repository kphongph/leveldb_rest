var dbutil = require('../util');
var locks = require('locks');
var request = require('request');

for(var i=0;i<100;i++) {
request({
  url:'http://202.143.174.208:8088/api/query/obec_students/host_class_room',
  method:'post',
  json:true,
  body:{'limit':100}
},function(err,res,body) {
  if(err) console.log(err);
});
}