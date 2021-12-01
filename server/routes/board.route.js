const express = require('express');
const router = express.Router();
const {Boards} = require('../models');
const { validateToken } = require("../middlewares/AuthMiddleware");
var controller= require('../controllers/board.controller');

router.get("/all", validateToken, controller.getAll);

router.get("/byId/:id", validateToken, async (req, res) => {
    const id = req.params.id;
    const board = await Boards.findByPk(id)
    res.json(board);
});

router.get("/:id", validateToken, controller.getById);

router.post("/create", validateToken, controller.create);

router.put("/updatetitle", validateToken, controller.updateTitle);

router.put("/updateboard", validateToken, controller.updateBoard);

router.delete("/delete/:boardId", validateToken, controller.delete);

module.exports = router;