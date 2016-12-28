var levelup = require('levelup');
var sublevel = require('level-sublevel');
var db = levelup('./databases/obec_students',{valueEncoding:'json'});

var count = 0;


var sdb =sublevel(db);
var sub = sdb.sublevel('indexes');


sub.createReadStream().on('data',function(data) {
  sub.del(data.key,function() {
    console.log(count,data.key);
    count++;
  });
});
