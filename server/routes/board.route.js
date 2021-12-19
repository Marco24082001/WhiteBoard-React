const express = require('express');
const router = express.Router();
const { validateToken } = require("../middlewares/AuthMiddleware");
var controller= require('../controllers/board.controller');

router.get("/all/:roomId", validateToken, controller.getAll);

router.get("/:id", validateToken, controller.getById);

router.post("/create", validateToken, controller.create);

router.put("/updateboard", validateToken, controller.updateBoard);

router.delete("/delete/:boardId", validateToken, controller.delete);

module.exports = router;