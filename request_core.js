var request = require('request');

module.exports = {
  post_request: function (uri,body, headers, cb) {
    request({
      method: 'POST',
      body: body,
      uri: uri,
      headers:headers,
      json: true,
    }, function (err, httpResponse, data) {
      if (err) {
        cb(err, null);
      } else {
        cb(null, data);
      }
    });
  },
  get_request: function (uri, headers,cb) {
    request({
      method: 'GET',
      uri: uri,
      headers:headers,
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
