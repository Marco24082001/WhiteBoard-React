const {Rooms} = require('../models');
const shortid = require('shortid');
const crypto = require("crypto");

module.exports.getById = async function(req, res) {
    // console.log(req.params.id);
    const roomId = req.params.id;
    Rooms.findOne({
        where: {
            roomId: roomId
        }           
    }).then((room) => {
        res.json(room);
    });
};

module.exports.getAll = function(req, res) {
    console.log(req.user.id);
    Rooms.findAll({
        where: {
            userId: req.user.id
        }   
    }).then(rooms => res.json(rooms));
};

module.exports.create = async function(req, res) {
    let { title, roomId} = req.body;
    const user = req.user;
    let exist_room = await Rooms.findOne({
        where: {
            roomId: roomId,
        }
    });

    while(exist_room) {
        roomId = crypto.randomBytes(30).toString("hex");
        exist_room = await Rooms.findOne({
            where: {
                roomId: roomId,
            }
        });
    }
    
    Rooms.create({ 
        title: title,
        roomId: roomId,
        userId: user.id,
    }).then(room => res.json(room))
};

module.exports.updateTitle = async function(req, res) {
    const {roomId, title} = req.body;
    
    console.log(roomId)
    await Rooms.update(
        {
            title: title
        },
        {
            where: {roomId: roomId}
        }
    ).then(() => res.json("edit successfully"));
};

module.exports.delete = async function(req, res) {
    const roomId = req.params.roomId;
    Rooms.destroy({
        where:{
            roomId: roomId,
            userId: req.user.id
        }
    }).then(() => res.json("delete successfully"));
};