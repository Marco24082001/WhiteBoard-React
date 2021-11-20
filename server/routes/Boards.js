const express = require('express');
const router = express.Router();
const {Boards} = require('../models');
const { validateToken } = require("../middlewares/AuthMiddleware");
const shortid = require('shortid');

router.get("/all", validateToken, (req, res) => {
    Boards.findAll({
        where: {
            userId: req.user.id
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
        res.json(board);
    });
});

router.post("/create", validateToken, async (req,res) => {
    let { title, room} = req.body;
    const user = req.user;
    let exist_board = await Boards.findOne({
        where: {
            room: room,
        }
    });

    while(exist_board) {
        room = shortid.generate();
        exist_board = await Boards.findOne({
            where: {
                room: room,
            }
        });
    }
    
    Boards.create({ 
        title: title,
        room: room,
        userId: user.id,
    }).then(board => res.json(board))
});

router.put("/updatetitle", validateToken, async (req, res) => {
    const {boardId, title} = req.body;
    console.log(boardId)
    await Boards.update(
        {
            title: title
        },
        {
            where: {id: boardId}
        }
    ).then(() => res.json("edit successfully"));
})

router.put("/updateboard", validateToken, async (req, res) => {
    const {room, dataUrl} = req.body;
    await Boards.update(
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
            userId: req.user.id
        }
    }).then(() => res.json("delete successfully"));
    res.json("DELETE SUCCESSFULLY");
})

module.exports = router;