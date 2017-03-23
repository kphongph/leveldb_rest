var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var path = require('path');

var service_interface = require('./routes/service_interface');
var config = require('./config');

var PORT = process.env.PORT || config.port;
var HOST = process.env.HOST || '';

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static(path.join(__dirname, 'views')));

app.use('/api',  service_interface);
app.use('/views', require('./routes/views'));

app.listen(8088);

/*
https.createServer(ssl.options, app).listen(PORT, HOST, null, function () {
  console.log('Server listening on port %d', this.address().port);
});
*/
