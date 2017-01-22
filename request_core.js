var request = require('request');

module.exports = {
  post_request: function (uri, body, cb) {
    request({
      method: 'POST',
      body: body,
      uri: uri,
      json: true,
    }, function (err, httpResponse, data) {
      if (err) {
        cb(err, null);
      } else {
        cb(null, data);
      }
    });
  },
  get_request: function (uri, cb) {
    request({
      method: 'GET',
      uri: uri,
      json: true
    }, function (err, httpResponse, data) {
      if (err) {
        cb(err, null);
      } else {
        cb(null, data);
      }
    });
  }
}
