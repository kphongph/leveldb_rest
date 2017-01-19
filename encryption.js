var crypto = require('crypto');
module.exports = {
  password_hash: function (password_user, salt) {
    var bytes = new Buffer(password_user || '', 'utf16le');
    var src = new Buffer(salt || '', 'base64');
    var dst = new Buffer(src.length + bytes.length);
    src.copy(dst, 0, 0, src.length);
    bytes.copy(dst, src.length, 0, bytes.length);
    return crypto.createHash('sha1').update(dst).digest('base64');
  },
  password_salt: function (password_user) {
    var password_salt = crypto.createHash('sha1').update(password_user).digest('base64');
    return password_salt;
  },
  random6charactor: function () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 6; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }
}