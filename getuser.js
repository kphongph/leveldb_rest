var login = require('./login');

module.exports = {
  _getUser_authen: function(req, res) {
    var key = req.params.key;
    login._getUser(key, function(err, value) {
      if (err) {
        res.json({
          'ok': false
        });
      } else {
        res.json(value);
      }
    });
  }
}