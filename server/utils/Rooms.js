
const Rooms = {};
Rooms.increaseRoom = function(room) {
    if(this[room] == undefined) this[room] = 1;
    else this[room]++;
}

Rooms.decreaseRoom = function(room) {
    this[room]--;
}

Rooms.Max = 100;

Rooms.checkCount = function(room) {
    if(this[room] == undefined) return true;
    if(this[room] < this.Max) return true;
    else return false;
}

module.exports = {
    Rooms
};

