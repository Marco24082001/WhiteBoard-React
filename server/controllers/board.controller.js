const {Boards} = require('../models');
const {Rooms} = require('../models')
const shortid = require('shortid');
const crypto = require("crypto");
module.exports.getAll = async function(req, res) {
    const roomId = req.params.roomId;
    const room  = await Rooms.findOne({
        where: {
            roomId: roomId,
        }
    })
    console.log(room.id);
    console.log(roomId);
    console.log('get All');
    console.log(roomId);
    Boards.findAll({
        where: {
            roomId: room.id
        }
    }).then(boards => res.json(boards));
};

module.exports.getById = async function(req, res) {
    const id = req.params.id;
    Boards.findOne({
        where: {
            id: id
        }           
    }).then(async (board) => {
        res.json(board);
    });
};

module.exports.create = async function(req, res) {
    let {roomId} = req.body;
    const room  = await Rooms.findOne({
        where: {
            roomId: roomId,
        }
    })
    Boards.create({ 
        roomId: room.id,
    }).then(board => res.json(board))
};

module.exports.updateBoard = async function(req, res) {
    const {boardId, dataUrl} = req.body;
    await Boards.update(
        { 
        dataUrl: dataUrl
        },
        {
            where: {id: boardId}
        }
    ).then(() => res.json("edit successfully"));
};

module.exports.delete = async function(req, res) {
    const boardId = req.params.boardId;
    Boards.destroy({
        where:{
            id: boardId
        }
    }).then(() => res.json("delete successfully"));
    res.json("DELETE SUCCESSFULLY");
};