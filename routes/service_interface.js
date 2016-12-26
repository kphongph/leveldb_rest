var express = require('express'); 
var router = express.Router(); 
var controller = require('./service_controller'); 

//GET METHOD 
router.get('/dbs',controller._listdbs); 
router.get('/dbs',controller._listdbs); 
router.get('/getUser/:key?', controller._getUser);

//PUT METHOD 
router.put('/dbs/:dbs', controller._createdb); 

//POST METHOD 
router.post('/dbs/:dbs/:id?', controller._putdata);
router.post('/upload/:container/:filename?', controller._upload_img);

//DELETE METHOD 
router.delete('/dbs/:dbs/:id', controller._daletedata); 
router.delete('/dbs/:dbs', controller._daletedb); 

module.exports = router;
