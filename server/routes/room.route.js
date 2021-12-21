const express = require('express');
const router = express.Router();
const { validateToken } = require("../middlewares/AuthMiddleware");
var controller= require('../controllers/room.controller');

router.get("/all", validateToken, controller.getAll);

router.get("/:id", validateToken, controller.getById);

router.post("/create", validateToken, controller.create);

router.put("/updatetitle", validateToken, controller.updateTitle);

router.delete("/delete/:roomId", validateToken, controller.delete);

module.exports = router;