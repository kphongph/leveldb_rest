var levelup = require('levelup');
var config = require('./config');
var fs = require('fs');
var levelindex = require('leveldb-index');
var levellog = require('leveldb-log');
var sublevel = require('level-sublevel');
var locks = require('locks');

var listdb2log = require('./listdb2log');

var dbs = {};

var isIndexing = function(name) {
  if(dbs[name].indexing > 0) return true;
  return false;
}

var rwlock = locks.createReadWriteLock();

var get_dbs = function(name, options, cb) {
  
  if (typeof cb === 'undefined') {
    cb = options;
    options = {
      'valueEncoding': 'json'
    };
  }

  if (!dbs[name] || dbs[name].db.isClosed()) {
    console.log('open');
    rwlock.timedReadLock(5000,function(err) {
      var re = /_index$/;
      if (re.test(name)) {
        options['valueEncoding'] = 'utf8';
      }
      var db = sublevel(levelup(config.db_path + '/' + name, options));          
    
      if(listdb2log.isdb_log(name)){
        db = levelindex(levellog(db));
      } else{
        db = levelindex(db);
      }    
    
      dbs[name] = {'indexing':0,'connection':0};
    
      if(config.index[name]) {
        config.index[name].attributes.forEach(function(attr) {
          dbs[name].indexing++;
          db.ensureIndex(attr.name,attr.map,function() {
            dbs[name].indexing--;
          //  console.log({'database':name,'views':attr.name,'message':'indexing complete'});
          });
        });
      }   
      dbs[name]['db'] = db;
      cb(null, db);
      rwlock.unlock();
    });
  } else {
    dbs[name].connection++;
    var self = this;
    var max_reuse = 50;
    if(dbs[name].connection > max_reuse) {
      rwlock.writeLock(function() {
        dbs[name].db.close(function(err) {
          self.get_dbs(name,cb);
          rwlock.unlock();
        });
      });
    } else {
      console.log('reuse');
      cb(null, dbs[name].db);
    }
  }
};

var create_db = function(name, options, cb) {
  this.get_dbs(name, options, function(err, db) {
    if (err) {
      cb({
        'ok': false,
        'message': err
      });
    } else {
      cb({
        'ok': true,
        'message': name + ' created'
      });
    }
  });
};

var list_db = function(cb) {
  fs.readdir(config.db_path, function(err, files) {
    if (err) {
      cb({
        'ok': false,
        'message': err
      });
    } else {
      cb({
        'ok': true,
        'dbs': files
      });
    }
  });
}

var put = function(name, key, value, cb) {
  this.get_dbs(name, function(err, db) {
    if (err) {
      cb({
        'ok': false,
        'message': err
      });
    } else {
      db.put(key, value, function(err) {
        if (err) {
          cb({
            'ok': false,
            'message': err
          });
        } else {
          cb({
            'ok': true,
            'key': key
          });
        }
      });
    }
  });
};

var del = function(name, key, cb) {
  this.get_dbs(name, function(err, db) {
    if (err) {
      cb({
        'ok': false,
        'message': err
      });
    } else {
      db.del(key, function(err) {
        if (err) {
          cb({
            'ok': false,
            'message': err
          });
        } else {
          cb({
            'ok': true,
            'key': key
          });
        }
      });
    }
  });
};

var deldb = function(name, cb) {
  var path = config.db_path + '/' + name;
  if (!dbs[name]) {
    cb({
      "ok": true,
      "message": "db is not exist"
    });
    deleteFolderRecursive(path);
  } else {
    var db = dbs[name].db;
    db.close(function() {
      deleteFolderRecursive(path);
      delete dbs[name];
      cb({
        'ok': true,
        'message': name + ' is destroyed'
      });
    });
  }
};

var deleteFolderRecursive = function(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function(file, index) {
      var curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
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
module.exports.isIndexing = isIndexing;
