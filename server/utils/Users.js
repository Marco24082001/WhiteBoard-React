const Users = [];

//join room to interact
function userJoin(id, username, room) {
    const user = {id, username, room};

    Users.push(user);
    return user;
}

//get current user
function getCurrentUser(id) {
    return Users.find(user => user.id == id);
}

function userLeave(id) {
    const index = Users.findIndex(user => user.id === id);
    return Users.splice(index, 1);
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave
};
