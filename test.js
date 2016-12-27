var levelup = require('levelup');
var levelQuery = require('./level-queryengine');
var pathEngine = require('./path-engine');

var db = levelup('./databases/student', {
  valueEncoding: 'json'
});

db = levelQuery(db);
db.query.use(pathEngine());

db.ensureIndex('CID');

// db.createReadStream({'limit':1}).on('data',console.log);

db.query(['CID', '1229901037421']).on('data', console.log)
  .on('stats', function(stats) {
    console.log(stats);
  });

/*
db.indexes['CID'].createIndexStream().on('data',console.log);
*/