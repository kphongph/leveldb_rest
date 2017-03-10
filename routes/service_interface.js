var express = require('express');
var router = express.Router();
var controller = require('./service_controller');
var list_indexs = require('./list_indexs');

//GET METHOD
router.get('/dbs', controller._listdbs);
router.get('/dbs/:dbs/:id?', controller._getdata);
router.get('/log/:db', controller._log);
router.get('/compactlog/:db', controller._compact);
router.get('/close/:db', controller._closedb);

router.use('/index', list_indexs);

//PUT METHOD
router.put('/dbs/:dbs', controller._createdb);

//POST METHOD
router.post('/dbs/:dbs/:id?', controller._putdata);
router.post('/query/:db/:index', controller._query);

//DELETE METHOD
router.delete('/dbs/:dbs/:id', controller._daletedata);
//router.delete('/dbs/:dbs', controller._daletedb);

module.exports = router;
