var bodyParser = require('body-parser');
var uuid = require('node-uuid');
var config = require('./config');
var request_core = require('./request_core');
var db_endpoint = 'https://maas.nuqlis.com:9000/';

var STATUS_DICT = {};
STATUS_DICT['คัดกรองแล้ว'] = 'screened';
STATUS_DICT['ย้าย/ลาออก'] = 'transfered';
STATUS_DICT['ไม่มีตัวตน'] = 'noidentity';
STATUS_DICT['พักการเรียน'] = 'droped';
STATUS_DICT['ทำไม่ทัน'] = 'notfinish';
STATUS_DICT['เสียชีวิต'] = 'die';
STATUS_DICT['อายุเกิน'] = 'older';

var update_host_summarry = function(input, res){
  var uri = db_endpoint + 'api/query/hostsummary/area_host?apikey=' + input.akey ;
  var obj = {
    start :[ input.area, input.hostid ],
    end:[ input.area, input.hostid + 'xff' ],
    limit:-1,
    include_doc:true
  };

  request_core.post_request(uri, obj, function(err, data){
    if (err) {
      res.json(data);
    }else{
      console.log(data)
      data[0].value.doc.screened += input.screened;
      data[0].value.doc.transfered += input.transfered;
      data[0].value.doc.noidentity += input.noidentity;
      data[0].value.doc.droped += input.droped;
      data[0].value.doc.notfinish += input.notfinish;
      data[0].value.doc.die += input.die;
      data[0].value.doc.older += input.older;
      uri = db_endpoint + 'api/dbs/hostsummary/' + data[0].value.key + '?apikey=' + input.akey;

      request_core.post_request(uri, data[0].value.doc, function(err, resdata){
        if (err) {
          res.json(resdata);
        }else{
          res.json(resdata);
        }
      });
    }
  });
};

module.exports = {
  _studentstatus : function(req, res){
    var uri = db_endpoint + 'api/dbs/obec_students/' + req.body.ckey + '?apikey=' + req.body.akey ;
    request_core.get_request(uri,   function(err, data) {
      if (err) {
        res.json(data);
      } else {
        var update_host_summarry_obj = {
          screened : 0,
          transfered: 0,
          noidentity: 0,
          droped: 0,
          notfinish: 0,
          die: 0,
          older: 0,
          changed: false,
          akey: req.body.akey,
          hostid: req.body.hostid,
          area: req.body.area
        };

        if(data.hasOwnProperty('status')){
          if( data.status !== req.body.value ){
            update_host_summarry_obj.changed = true;
            update_host_summarry_obj[STATUS_DICT[data.status]] = -1;
            update_host_summarry_obj[STATUS_DICT[req.body.value]] = 1;
            data.status = req.body.value;
          }
        }else{
          data.status = req.body.value;
          update_host_summarry_obj.changed = true;
          update_host_summarry_obj[STATUS_DICT[req.body.value]] = 1;
        }

        if(update_host_summarry_obj.changed === true){
          request_core.post_request(uri, data, function(err, resdata){
            if (err) {
              res.json(resdata);
            }else{
              update_host_summarry(update_host_summarry_obj, res) ;
            }
          });
        }else{
          res.json({ok:true});
        }
      }
    });
  },
  _formrecord : function(req, res){
    var uri = db_endpoint + 'api/dbs/form_record/' + req.params.id  + '?apikey=' + req.query.apikey  ;
    request_core.get_request(uri, function(err, data) {
      if(err){
        res.json(data);
      }else{
        var update_host_summarry_obj = {
          screened : 0,
          transfered: 0,
          noidentity: 0,
          droped: 0,
          notfinish: 0,
          die: 0,
          older: 0,
          changed: false,
          akey: req.query.apikey,
          hostid: req.body.hostid,
          area: req.query.area
        };

        if(!data.hasOwnProperty('ok')){
          if(data.group[4].questions[0].answers[0].selected == true){
            update_host_summarry_obj.screened = req.body.group[4].questions[0].answers[0].selected === true? 0 : -1;
            update_host_summarry_obj.changed = req.body.group[4].questions[0].answers[0].selected === true? false : true;
          }else{
            update_host_summarry_obj.screened = req.body.group[4].questions[0].answers[0].selected === true? 1 : 0;
            update_host_summarry_obj.changed = req.body.group[4].questions[0].answers[0].selected === true? true : false;
          }
        }

        request_core.post_request(uri, req.body, function(err, resdata){
          if (err) {
            res.json(resdata);
          }else{
            if(update_host_summarry_obj.changed === true){
              update_host_summarry(update_host_summarry_obj, res) ;
            }else{
              res.json(resdata);
            }
          }
        });
      }
    });
  }
}
