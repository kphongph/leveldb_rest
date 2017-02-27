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
STATUS_DICT['จบการศึกษา'] = 'grad';

var init_host_summary = function(input, res){
  var url = db_endpoint + 'api/query/obec_students/host_class_room?apikey=' + input.akey;
  var obj = {
    start: [ input.hostid],
    end: [ input.hostid + 'xff'],
    limit: -1,
    include_doc: true
  };

  request_core.post_request(url, obj, function(err, data){
    if (err) {
      res.json(data);
    }else{
      var totalchild = 0;
      for (var i = 0; i < data.length; i++) {
        if (data[i].value.doc.WelfareId == '09' || data[i].value.doc.welfareId == '09'
        || data[i].value.doc.welfareid == '09')  {
          if (data[i].value.doc.class != null) {
            totalchild++;
          }
        }
      }

      var tmpObj = {
        fullchilbydmc : totalchild,
        screened : input.screened,
        transfered : input.transfered,
        noidentity : input.noidentity,
        droped : input.droped,
        notfinish : input.notfinish,
        die : input.die,
        older : input.older,
        grad : input.grad,
        areaid : input.area,
        hostid : input.hostid
      };

      uri = db_endpoint + 'api/dbs/hostsummary/?apikey=' + input.akey;
      request_core.post_request(uri, tmpObj, function(err, resdata){
        if (err) {
          res.json(resdata);
        }else{
          res.json(resdata);
        }
      });
    }
  });
};

var update_host_summary = function(input, res){
  var get_uri = db_endpoint + 'api/query/hostsummary/hostid?apikey=' + input.akey ;
  var get_obj = {
    start :[ input.hostid ],
    end:[  input.hostid + 'xff' ],
    limit:-1,
    include_doc:true
  };
  var post_uri = '';
  var updatetime = new Date().getTime().toString();

  request_core.post_request(get_uri, get_obj, function(err, data){
    if (err) {
      update_host_summary(input, res);
    }else{
      if (data.length > 0) {
        post_uri = db_endpoint + 'api/dbs/hostsummary/' + data[0].value.key + '?apikey=' + input.akey ;
        data[0].value.doc.updatetime = updatetime;

        request_core.post_request(post_uri, data[0].value.doc, function(err2, data2){
          if (err2) {
            update_host_summary(input, res);
          }else{
            request_core.post_request(get_uri, get_obj, function(err3, data3){
              if (err3) {
                update_host_summary(input, res);
              }else{
                if(data3.length > 0){
                  if(data3[0].value.doc.updatetime === updatetime){
                    data3[0].value.doc.screened += input.screened;
                    data3[0].value.doc.transfered += input.transfered;
                    data3[0].value.doc.noidentity += input.noidentity;
                    data3[0].value.doc.droped += input.droped;
                    data3[0].value.doc.notfinish += input.notfinish;
                    data3[0].value.doc.die += input.die;
                    data3[0].value.doc.older += input.older;
                    data3[0].value.doc.grad += input.grad;

                    request_core.post_request(post_uri, data3[0].value.doc, function(errres, resdata){
                      if (errres) {
                        res.json(resdata);
                      }else{
                        res.json(resdata);
                      }
                    });
                  }else{
                    setTimeout(function() {
                      update_host_summary(input, res);
                    }, Math.floor(Math.random() * (500 - 50) + 50));
                  }
                }else{
                  res.json(data3);
                }
              }
            });
          }
        });
      }else{
        init_host_summary(input, res);
      }
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
          grad: 0,
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
              update_host_summary(update_host_summarry_obj, res) ;
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
    var uri2 = db_endpoint + 'api/dbs/obec_students/' + req.params.id.split(':')[0] + '?apikey=' + req.body.apikey ;
    request_core.get_request(uri, function(err, data) {
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
          grad: 0,
          changed: false,
          akey: req.query.apikey,
          hostid: req.body.hostid,
          area: req.query.area
        };

        if(data.hasOwnProperty('status')){
          update_host_summarry_obj.changed = true;
          update_host_summarry_obj[STATUS_DICT[data.status]] = -1;
          data.status = req.body.value;
          delete data.status;
          update_host_summarry_obj.screened = 1;

          request_core.post_request(uri2, data, function(err, resStudentPostdata){
            if (err) {
              res.json(resStudentPostdata);
            }else{
              request_core.get_request(uri, function(err, resFormdata) {
                if(err){
                  res.json(resFormdata);
                }else{
                  if(!resFormdata.hasOwnProperty('ok')){
                    if(resFormdata.group[3].questions[0].answers[0].selected == true){
                      update_host_summarry_obj.screened = req.body.group[3].questions[0].answers[0].selected === true? 0 : -1;
                    }else{
                      update_host_summarry_obj.screened = req.body.group[3].questions[0].answers[0].selected === true? 1 : 0;
                    }
                  }

                  request_core.post_request(uri, req.body, function(err, resdata){
                    if (err) {
                      res.json(resdata);
                    }else{
                      if(update_host_summarry_obj.changed === true){
                        update_host_summary(update_host_summarry_obj, res) ;
                      }else{
                        res.json(resdata);
                      }
                    }
                  });
                }
              });
            }
          });
        } else{
          request_core.get_request(uri, function(err, resFormdata) {
            if(err){
              res.json(resFormdata);
            }else{
              if(!resFormdata.hasOwnProperty('ok')){
                if(resFormdata.group[3].questions[0].answers[0].selected == true){
                  update_host_summarry_obj.screened = req.body.group[3].questions[0].answers[0].selected === true? 0 : -1;
                  update_host_summarry_obj.changed = req.body.group[3].questions[0].answers[0].selected === true? false : true;
                }else{
                  update_host_summarry_obj.screened = req.body.group[3].questions[0].answers[0].selected === true? 1 : 0;
                  update_host_summarry_obj.changed = req.body.group[3].questions[0].answers[0].selected === true? true : false;
                }
              }

              request_core.post_request(uri, req.body, function(err, resdata){
                if (err) {
                  res.json(resdata);
                }else{
                  if(update_host_summarry_obj.changed === true){
                    update_host_summary(update_host_summarry_obj, res) ;
                  }else{
                    res.json(resdata);
                  }
                }
              });
            }
          });
        }
      }
    });
  }
}

