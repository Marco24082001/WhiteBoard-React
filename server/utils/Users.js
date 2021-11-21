const Users = [];

//join room to interact
function userJoin(socketId, id, username, role_id, photo, room) {
    const user = {socketId, id, username, role_id, photo, room};
    const index = Users.findIndex(user => user.id === id);
    if(index === -1){
        Users.push(user);
    }
    return user;
}

//get current user
function getCurrentUser(socketId) {
    return Users.find(user => user.socketId == socketId);
}

function userLeave(socketId) {
    const index = Users.findIndex(user => user.socketId === socketId);
    console.log(index);
    return Users.splice(index, 1);
}

function getRoomUsers(room) {
    return Users.filter(user => user.room == room);
}

function changeRoleId(userId, roomId, role_id) {
    const index = Users.findIndex(user => {
        return user.id === userId && user.room == roomId;
    });
    if(index != -1){
        Users[index].role_id = role_id;
    }
    console.log(index);
    return index;
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    changeRoleId,
};
