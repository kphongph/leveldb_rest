var request = require('request');

module.exports = {
  post_request: function (uri, body, cb) {
    request({
      method: 'POST',
      uri: uri,
      json: body,
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
      uri: uri
    }, function (err, httpResponse, data) {
      if (err) {
        cb(err, null);
      } else {
        cb(null, data);
      }
    });
  }
}
