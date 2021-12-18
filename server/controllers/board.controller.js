const {Boards} = require('../models');
const shortid = require('shortid');
const crypto = require("crypto");
module.exports.getAll = function(req, res) {
    Boards.findAll({
        where: {
            userId: req.user.id
        }
    }).then(boards => res.json(boards));
};

module.exports.getById = async function(req, res) {
    const room = req.params.id;
    Boards.findOne({
        where: {
            room: room
        }           
    }).then(async (board) => {
        res.json(board);
    });
};

module.exports.create = async function(req, res) {
    let { title, room} = req.body;
    const user = req.user;
    let exist_board = await Boards.findOne({
        where: {
            room: room,
        }
    });

    while(exist_board) {
        room = crypto.randomBytes(30).toString("hex");
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
};

module.exports.updateTitle = async function(req, res) {
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
};

module.exports.updateBoard = async function(req, res) {
    const {room, dataUrl} = req.body;
    await Boards.update(
        { 
        dataUrl: dataUrl
        },
        {
            where: {room: room}
        }
    ).then(() => res.json("edit successfully"));
};

module.exports.delete = async function(req, res) {
    const boardId = req.params.boardId;
    Boards.destroy({
        where:{
            id: boardId,
            userId: req.user.id
        }
    }).then(() => res.json("delete successfully"));
    res.json("DELETE SUCCESSFULLY");
};