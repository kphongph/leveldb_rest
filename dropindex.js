var subindex = require('./subindex');
var levelup = require('levelup');

var db = levelup('./databases/pk_obec_students',{valueEncoding:'json'});

var sub = subindex(db);

sub.dropIndex('host_class_room',function() {
  console.log('index dropped');
});
