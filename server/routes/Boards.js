const express = require('express')
const router = express.Router()
const {Boards} = require('../models');
const { validateToken } = require("../middlewares/AuthMiddleware");

router.get("/all", validateToken, (req, res) => {
    Boards.findAll({
        where: {
            UserId: req.user.id
        }
    }).then(boards => res.json(boards));
});

router.get("/byId/:id", validateToken, async (req, res) => {
    const id = req.params.id;
    const board = await Boards.findByPk(id)
    res.json(board);
});

router.get("/:id", validateToken, async (req, res) => {
    const room = req.params.id;
    Boards.findOne({
        where: {
            room: room
        }
    }).then(async (board) => {
        var bufferBase64 = new Buffer( board.dataUrl, 'binary' ).toString('base64');
        res.json(bufferBase64);
    });
});

router.post("/create", validateToken, (req,res) => {
    const { title, room} = req.body;
    const user = req.user;
    Boards.create({ 
        title: title,
        room: room,
        UserId: user.id,
    }).then(board => res.json(board))
});

router.put("/updatetitle", validateToken, (req, res) => {
    const {boardId, title} = req.body;
    Boards.update(
        {
            title: title
        },
        {
            where: {id: boardId}
        }
    ).then(() => res.json("edit successfully"));
})

router.put("/updateboard", validateToken, (req, res) => {
    const {room, dataUrl} = req.body;
    console.log(req.body.dataUrl);
    // dataURLtoBlob(data)
    Boards.update(
        { 
        dataUrl: dataUrl
        },
        {
            where: {room: room}
        }
    ).then(() => res.json("edit successfully"));
})

router.delete("/delete/:boardId", validateToken, (req, res) => {
    const boardId = req.params.boardId;
    Boards.destroy({
        where:{
            id: boardId,
            UserId: req.user.id
        }
    }).then(() => res.json("delete successfully"));
    res.json("DELETE SUCCESSFULLY");
})

module.exports = router;