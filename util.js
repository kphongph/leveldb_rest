var levelup = require('levelup');
var subindex = require('subindex');
var levelQuery = require('level-queryengine');
var jsonqueryEngine = require('jsonquery-engine');
var config = require('./config');
var fs = require('fs');

var dbs = {};

var get_dbs = function(name,options,cb) {
  if(typeof cb === 'undefined') {
    cb = options;
    options = {'valueEncoding':'json'};
  }

  if(!dbs[name]) {
    var re = /_index$/;
    if(re.test(name)) {
      options['valueEncoding']='utf8';
    }
    levelup(config.db_path+'/'+name,options,function(err, db) {
      if (err) {
        cb(err, null);
      } else {
        if(config.index[name]) {
          db = levelQuery(db);
          db.query.use(jsonqueryEngine());
          config.index[name].attributes.forEach(function(attr) {
            console.log(attr);
            db.ensureIndex(attr);
          });
        }
        dbs[name] = {'db':db};
        cb(null, db);
      }
    });
  } else {
    cb(null, dbs[name].db);
  }
};

var create_db = function(name,options,cb) {
  this.get_dbs(name,options,function(err,db) {
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

var deldb = function(name,cb) {
  var path = config.db_path+'/'+name;
  if(!dbs[name]) {
    cb({"ok":true,"message":"db is not exist"});
    deleteFolderRecursive(path);
  } else {
    var db = dbs[name].db;
    db.close(function() {
      deleteFolderRecursive(path);
      delete dbs[name];
      cb({'ok':true,'message':name+' is destroyed'});
    });
  }
};


var deleteFolderRecursive = function(path) {
  if(fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

module.exports.get_dbs = get_dbs;
module.exports.put = put;
module.exports.del = del;
module.exports.deldb = deldb;
module.exports.create_db = create_db;
module.exports.list_db = list_db;

