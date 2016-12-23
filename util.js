var levelup = require('levelup');
var config = require('./config');
var fs = require('fs');

var dbs = {};

var get_dbs = function(name,options,cb) {
  if(typeof cb === 'undefined') {
    cb = options;
    options = {'valueEncoding':'json'};
  }

  if(!dbs[name]) {
    levelup(config.db_path+'/'+name,options,function(err, db) {
      if (err) {
        cb(err, null);
      } else {
        dbs[name] = {'db':db};
        cb(null, db);
      }
    });
  } else {
    cb(null, dbs[name].db);
  }
};

var create_db = function(name,options,cb) {
  get_dbs(name,options,function(err,db) {
    if(err) { 
      cb({'ok':false,'message':err});
    } else {
      cb({'ok':true,'message':name+' created'});
    }
  });
};

var list_db = function(cb) {
  fs.readdir(config.db_path,function(err,files) {
    if(err) { 
      cb({'ok':false,'message':err});
    } else {
      cb({'ok':true,'dbs':files});
    }
  });
}

var put = function(name,key,value,cb) {
  this.get_dbs(name,function(err,db) {
    if(err) { 
      cb({'ok':false,'message':err});
    } else {
      db.put(key,value,function(err) {
        if(err) {
          cb({'ok':false,'message':err});
        } else {
          cb({'ok':true,'key':key});
        }
      });
    }
  });
};

var del = function(name,key,cb) {
  this.get_dbs(name,function(err,db) {
    if(err) { 
      cb({'ok':false,'message':err});
    } else {
      db.del(key,function(err) {
        if(err) {
          cb({'ok':false,'message':err});
        } else {
          cb({'ok':true,'key':key});
        }
      });
    }
  });
};

module.exports.get_dbs = get_dbs;
module.exports.put = put;
module.exports.del = del;
module.exports.create_db = create_db;
module.exports.list_db = list_db;

