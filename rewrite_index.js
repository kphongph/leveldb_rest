var util = require('./util');

var count = 0;
var db_name = "form_record_new";
util.get_dbs('form_record_new_old', function(err, db) {
  if (err) {
    console.log({
      'ok': false,
      'message': err
    });
  } else {
    db.createReadStream()
      .on('data', function(data) {
        util.put('form_record_new', data.key, data.value, function(result) {
          count++;
          console.log(count, data.key);
        });
      })
      .on('end', function() {
        console.log('Stream ended');
      })
  }
});
