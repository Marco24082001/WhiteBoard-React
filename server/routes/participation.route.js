const express = require('express');
const router = express.Router();
const { validateToken } = require("../middlewares/AuthMiddleware");
var controller= require('../controllers/participation.controller');

router.post('/create', validateToken, controller.create);

router.get('/isParticipant/:roomId', validateToken, controller.isParticipant);

router.put('/updateRole', validateToken, controller.updateRole);

module.exports = router;