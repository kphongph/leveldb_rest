var uuid = require('node-uuid');
var JSONStream = require('JSONStream');
var util = require('../util');

module.exports = {
  _query: function(req, res) {
    var db_name = req.params.db;
    var index = req.params.index;
    util.get_dbs(db_name, function(err, db) {
      if (err) {
        res.json({
          'ok': false,
          'message': err
        });
      } else {
        console.log(index,req.body);
        db.indexes[index].createIndexStream(req.body)
        .pipe(JSONStream.stringify())
        .pipe(res);
      }
    });
  },

  _getdata: function(req, res) {
    var db_name = req.params.dbs;
    var key = req.params.id ? req.params.id : '';
    util.get_dbs(db_name, function(err, db) {
      if (err) {
        res.json({
          'ok': false,
          'message': err
        });
      } else {

        if (key == '') {
          var opt = {
            limit: 50
          };
          if (req.query.start) opt['start'] = req.query.start
          if (req.query.end) opt['end'] = req.query.end
          if (req.query.gt) opt['gt'] = req.query.gt
          if (req.query.lt) opt['lt'] = req.query.lt
          if (req.query.gte) opt['gte'] = req.query.gte
          if (req.query.lte) opt['lte'] = req.query.lte
          if (req.query.limit) {
            var limit = parseInt(req.query.limit);
            opt['limit'] = limit ? limit : 50;
          }

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
    var _key = req.params.id ? req.params.id : uuid.v1();
    var _key = _key.replace(/-/g, '');
    var _value = req.body;
    delete _value.apikey;
    if (_value['.id']) {
      util.put(db_name, _key, _value['.id'], function(result) {
        res.json(result);
      });
    } else {
      util.put(db_name, _key, _value, function(result) {
        res.json(result);
      });
    }
  },

  _daletedata: function(req, res) {
    var db_name = req.params.dbs;
    var _key = req.params.id;

    util.del(db_name, _key, function(result) {
      res.json(result);
    });
  },
  _daletedb: function(req, res) {
    var db_name = req.params.dbs;

    util.deldb(db_name, function(result) {
      res.json(result);
    });
  },
  _listdbs: function(req, res) {
    util.list_db(function(result) {
      res.json(result);
    });
  },
  _createdb: function(req, res) {
    var db_name = req.params.dbs;
    var options = req.body;
    util.create_db(db_name, options, function(result) {
      res.json(result);
    });
  }
};
