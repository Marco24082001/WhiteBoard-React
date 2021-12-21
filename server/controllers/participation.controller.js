const {Room_participant} = require('../models');
const {Rooms} = require('../models');
// 1: owner, 2: admin, 3: guest, 4: kicked

module.exports.create = async function(req, res) {
    let {roomId, role_id} = req.body;

    Room_participant.create({
        roomId: roomId,
        userId: req.user.id,
        role_id: role_id
    }).then(() => { 
        res.json("Successfully!")
        console.log('thanh cong')
    }).catch((err) => res.json({error: err}));
};

module.exports.isParticipant = async function(req, res) {
    const userId = req.user.id;
    const roomId = req.params.roomId;
    console.log(roomId);
    const room = await Rooms.findOne({
        where: {
            roomId: roomId,
        }
    });
    if(!room) {
        console.log(room);
        return res.json({error: "not exit room"})
    }else {
        const participant = await Room_participant.findOne({
            where: {
                userId: userId,
                roomId: room.id,
            }
        });
    
        if(!participant) {
            Room_participant.create({
                roomId: room.id,
                userId: userId,
                role_id: 3,
            }).then((rs) => {
                return res.json({role_id: rs.role_id})
            })
        }
        else {
            return res.json({role_id: participant.role_id})
        };
    }
    
};

module.exports.updateRole = async function(req, res) {
    const {userId, roomId, role_id} = req.body;
    console.log('updateRolexxxxxxxxxxxxxxxxxxx')
    console.log(userId);
    const room = await Rooms.findOne({
        where: {
            roomId: roomId,
        }
    });

    if(!room) {
        return res.json({error: 'Not exited Board'});
    }else {
        Room_participant.update(
            {
                role_id : role_id
            },
            {
                where: {
                    userId: userId,
                    roomId: room.id,
                }
            }
        ).then((rs) => res.json("Successfully!"))
         .catch((err) => res.json({error: err}));
    }
};