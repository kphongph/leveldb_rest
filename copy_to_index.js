var levelup = require('levelup');
var subindex = require('leveldb-index');
var fs = require('fs');

var copy = function(src,tar,cb) {
  var count = 0;
  var end = false;
  var records = 0;
  var copying = false;
  src.createReadStream().on('data',function(data) {
    copying = true;
    count++;
    records++;
    tar.put(data.key,data.value,function(err,result) {
      count--;
      if(count===0 && end) {
        cb();
      }
    });
  }).on('end',function() {
    if(!copying) {
      cb();
    } else {
      console.log('Total:',records);
      end=true;
    }
  });
}

var count = function(db,cb) {
  var count = 0;
  db.createReadStream().on('data',function(data) {
     count++;
  }).on('end',function() {
     cb(count);
  });
}


var clone = function(dir_src,dir_dest,file_name,cb) {
  var src_db = levelup('./'+dir_src+'/'+file_name,{valueEncoding:'json'});
  var _tar = levelup('./'+dir_dest+'/'+file_name,{valueEncoding:'json'});
  var tar_db = subindex(_tar);

  console.log('Copying From',file_name);

  copy(src_db,tar_db,function() {
    console.log('done!');
    count(tar_db,function(records) {
      console.log('',records,'in '+file_name);
      cb();
    });
  });
};


var db_dir = 'databases';

var sync = function(dir_src,dir_dest,list,cb) {
  var file = list.pop(); 
  if(!file) { 
    cb();
  } else {
    clone(dir_src,dir_dest,file,function() {
      sync(dir_src,dir_dest,list,cb);
    });
  }
}

fs.readdir('./'+db_dir,function(err,files) {
  sync(db_dir,db_dir+'_index',files,function() {
    console.log('---> Done');
  });
});
