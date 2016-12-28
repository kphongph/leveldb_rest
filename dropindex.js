var subindex = require('./subindex');
var levelup = require('levelup');

var db = levelup('./databases/course',{valueEncoding:'json'});

var sub = subindex(db);

sub.dropIndex('schooltime',function() {
  console.log('index dropped');
});
