var JSONStream = require('JSONStream');
var uuid = require('node-uuid');
var _util = require('util');
var multiparty = require('multiparty');
var azure = require('azure');
var Readable = require('stream').Readable;
var util = require('../util');
var config = require('../config');
var login = require('../login');

module.exports = {
  _getdata: function(req, res) {
    //console.log(req.session);
    //console.log(req.user);
    var db_name = req.params.dbs;
    var key = req.params.id ? req.params.id : '';    
    //console.log('db_name : '+db_name+'  key : '+key+'  limit : '+limit);
    util.get_dbs(db_name, function(err, db) {
      if (err) {
        res.json({
          'ok': false,
          'message': err
        });
      } else {
        //res.setHeader('Content-Type', 'application/json');        
        if (key == '') {
          var opt = {
             limit:50
          };          
          if(req.query.start) opt['start'] = req.query.start
          if(req.query.end) opt['end'] = req.query.end
          if(req.query.gt) opt['gt'] = req.query.gt
          if(req.query.lt) opt['lt'] = req.query.lt
          if(req.query.gte) opt['gte'] = req.query.gte
          if(req.query.lte) opt['lte'] = req.query.lte
          if(req.query.limit) {
            var limit = parseInt(req.query.limit);
            opt['limit'] = limit?limit:50;
          }
          console.log(opt);

          db.createReadStream(opt)
            .pipe(JSONStream.stringify())
            .pipe(res);
        } else {
          db.get(key, function(err, value) {
            if (err) {
              res.json({
                'ok': false,
                'message': err
              });
            } else {
              res.json(value);
            }
          })

        }
      }
    });
  },

  _putdata: function(req, res) {
    var db_name = req.params.dbs;
    var _key = req.params.id?req.params.id:uuid.v1();
    var _key = _key.replace(/-/g,'');
    var _value = req.body;
    delete _value.apikey;
    if(_value['.id']) {
      util.put(db_name,_key,_value['.id'],function(result) {
        res.json(result);
      });
    } else {
      util.put(db_name,_key,_value,function(result) {
        res.json(result);
      });
    }
  },

  _daletedata: function(req, res) {
    var db_name = req.params.dbs;
    var _key = req.params.id;

    util.del(db_name,_key,function(result) {
      res.json(result);
    });
  },
  _daletedb: function(req, res) {
    var db_name = req.params.dbs;

    util.deldb(db_name,function(result) {
      res.json(result);
    });
  },
  _listdbs : function(req,res) {
    util.list_db(function(result) {
      res.json(result);
    });
  },
  _createdb : function(req,res) {
    var db_name = req.params.dbs;
    var options = req.body;
    util.create_db(db_name,options,function(result) {
      res.json(result);
    });
  },
  _upload_img : function(req,res) {
    var blobService = azure.createBlobService(config.azure_blob_accountName, config.azure_blob_accessKey);
    var container = req.params.container;
	
    
    // request as base64 image ex. image.jpg;;data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...
    if(req.headers['content-type'].indexOf('text/plain') !== -1){
      var body = '';
      req.on('data', function (data) { body += data; });
      req.on('end', function () {
        var fileName = req.params.filename;
        var image = new Buffer(body.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        
        var s = new Readable();
        s.push(image); s.push(null);
        
        blobService.createBlockBlobFromStream(container, fileName, s, image.length, function(error) {
          if (error) { res.end(error) }
        });
        res.end('OK');
      });
    }
    else{ // request as form action
      var form = new multiparty.Form();
      form.on('part', function(part) {
        if (!part.filename) return;
        var size = part.byteCount;
        var name = part.filename;
        blobService.createBlockBlobFromStream(container, name, part, size, function(error) {
          if (error) { res.end(error) }
        });
      });
      form.parse(req);
      res.end('OK');
    }
  },
   _getUser:function(req, res){
		var key = req.params.key;
		login._getUser(key, function(err, value){
			if (err) {
				res.json({
        'ok': false});
			}else{
				res.json(value);
			}
		});
	}
};
