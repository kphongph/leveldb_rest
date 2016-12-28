var levelup = require('levelup');
var subindex = require('leveldb-index');

var copy = function(src,tar,cb) {
  var count = 0;
  var end = false;
  var records = 0;
  src.createReadStream().on('data',function(data) {
    count++;
    records++;
    tar.put(data.key,data.value,function(err,result) {
      count--;
      if(count===0 && end) {
        cb();
      }
    });
  }).on('end',function() {
    console.log('Total:',records);
    end=true;
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

var src_str = process.argv[2];

var src_db = levelup('./databases/'+src_str,{valueEncoding:'json'});
var _tar = levelup('./databases/'+src_str+'_i',{valueEncoding:'json'});
var tar_db = subindex(_tar);

console.log('Copying From',src_str,'To',src_str+'_i');

copy(src_db,tar_db,function() {
  console.log('done!');
  count(tar_db,function(records) {
    console.log('',records,'in '+src_str+'_i');
  });
});
