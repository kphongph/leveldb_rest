var express = require('express');
var config = require('../config');
var router = express.Router();

router.get('/', function (req, res) {
    res.json(config.index);
});

module.exports = router;
