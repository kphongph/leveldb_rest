var express = require('express');
var config = require('../config');
var router = express.Router();

router.get('/', function (req, res) {
   if(req.query.dbs){
     var data = config.index;
     res.send(data[req.query.dbs]);
   }else{
     res.json(config.index);
   }
});

module.exports = router;
