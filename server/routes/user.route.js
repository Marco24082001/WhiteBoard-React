const express = require("express");
const router = express.Router();
const { validateToken } = require("../middlewares/AuthMiddleware");
var controller= require('../controllers/user.controller');


router.post("/", controller.signup);

router.post("/login", controller.login);

router.get("/auth", validateToken, controller.auth);

router.get('/photo', validateToken, controller.getPhoto);

router.post("/reset-password", controller.resetPassword);

router.post("/new-password", controller.newPassword);

router.put('/setting-info', validateToken, controller.settingInfo);

module.exports = router;