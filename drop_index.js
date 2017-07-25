var util = require('./util');

var db_name = "obec_students";
util.get_dbs(db_name, function(err, db) {
  if (err) {
    console.log({
      'ok': false,
      'message': err
    });
  } else {
    db.dropIndex('cid', function () {
      console.log('dropped');
    });
  }
});

