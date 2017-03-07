var bodyParser = require('body-parser');
var config = require('./config');
var request_core = require('./request_core');
var db_endpoint = 'https://maas.nuqlis.com:9000/';


module.exports = {
  _studentstatus : function(req, res){
    var uri = db_endpoint + 'api/dbs/obec_students/' + req.body.ckey + '?apikey=' + req.body.akey ;
    request_core.get_request(uri,   function(err, data) {
      if (err) {
        res.json(data);
      } else {
        data.status = req.body.value;

        request_core.post_request(uri, data, function(err, resdata){
          res.json(resdata);
        });
      }
    });
  },
  _formrecord : function(req, res){
    var uri = db_endpoint + 'api/dbs/form_record/' + req.params.id  + '?apikey=' + req.query.apikey  ;

    request_core.post_request(uri, req.body, function(err, resdata){
      res.json(resdata);
    });
  }
}

