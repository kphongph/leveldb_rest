var path = require('path');
var fs = require('fs');

var certsPath = path.join(__dirname, 'ssl_certificate', 'server');
var caCertsPath = path.join(__dirname, 'ssl_certificate', 'ca');

module.exports.options = {
  /*---ssl certificate---*/
  key: fs.readFileSync(path.join(certsPath, 'my-server.key.pem')),
  cert: fs.readFileSync(path.join(certsPath, 'server-name.crt.pem')),
  ca: [
    fs.readFileSync(path.join(caCertsPath, 'ca-name.crt.pem'))
    // ,fs.readFileSync(path.join(caCertsPath, 'root.crt.pem'))
  ],
  requestCert: false,
  rejectUnauthorized: true
  /*---ssl certificate---*/
};

