const {Room_participant} = require('../models');

// 1: owner, 2: admin, 3: guest, 4: kicked

module.exports.create = function(req, res) {
    let {boardId, role_id} = req.body;
    // let exist_participant = await Boards.findOne({
    //     where: {
    //         boardId: boardId,
    //         userId: req.user.id,
    //     }
    // });

    Room_participant.create({
        boardId: boardId,
        userId: req.user.id,
        role_id: role_id
    }).then(() => { 
        res.json("Successfully!")
    }).catch((err) => res.json({error: err}));
};

module.exports.isParticipant = async function(req, res) {
    const userId = req.user.id;
    console.log(req.params.boardId);
    const boardId = req.params.boardId;
    const participant = await Room_participant.findOne({
        where: {
            userId: userId,
            boardId: boardId,
        }
    });

    if(!participant) {
        Room_participant.create({
            boardId: boardId,
            userId: userId,
            role_id: 3,
        }).then((rs) => {
            return res.json({role_id: rs.role_id})
        })
    }
    else {
        return res.json({role_id: participant.role_id})
    };
};

module.exports.updateRole = async function(req, res) {
    const {userId, boardId, role_id} = req.body;
    console.log('vao dc day roi')
    Room_participant.update(
        {
            role_id : role_id
        },
        {
            where: {
                userId: userId,
                boardId: boardId
            }
        }
    ).then((rs) => res.json("Successfully!"))
     .catch((err) => res.json({error: err}));
};