var express = require('express'); 
var router = express.Router(); 
var controller = require('./service_controller'); 

//GET METHOD 
router.get('/dbs',controller._listdbs); 
router.get('/dbs/:dbs/:id?', controller._getdata); 

//PUT METHOD 
router.put('/dbs/:dbs', controller._createdb); 

//POST METHOD 
router.post('/dbs/:dbs/:id?', controller._putdata);

//DELETE METHOD 
router.delete('/dbs/:dbs/:id', controller._daletedata); 

module.exports = router;
