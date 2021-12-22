require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const socket = require('socket.io');
const db = require('./models');
const {Rooms} = require('./utils/Rooms');
const {userJoin, getCurrentUser, userLeave, getRoomUsers, changeRoleId} = require('./utils/Users');
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socket(server,{
    cors: {
        origin: "*",
        methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
        allowedHeaders:["secretHeader"],
        credentials: true
      }
})

app.use(cors({
    origin: '*',
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}))

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));

function onConnection(socket){
    console.log("user online");
    socket.on('joinRoom', ({roomId, _user}) => {
        if(Rooms.checkCount(roomId)) {
            console.log('sdfsdfsdfoshfohsdfosodfj');
            // console.log(socket.id);
            socket.join(roomId);
            Rooms.increaseRoom(roomId);
            userJoin(socket.id, _user.id, _user.username, _user.role_id, _user.photo, roomId);
            const listOfUsers = getRoomUsers(roomId);
            socket.broadcast.in(roomId).emit('share-data', 'a person has joined the board');
            io.in(roomId).emit('listOfUsers', listOfUsers);
        }
        else socket.emit('error', 'Board is full');
    })  

    // listen for canvas-data
    socket.on('canvas-data', (data) => {
        socket.to(data.roomId).emit('canvas-data', data, );
    })

    socket.on('undoBoard', (data) => {
        socket.to(data.roomId).emit('undoBoard', data, );
    })

    socket.on('eraser-data', (data) => {
        socket.to(data.roomId).emit('eraser-data', data,);
    })

    socket.on('refresh', (data) => {
        socket.to(data.roomId).emit('refresh', data);
    })

    // listen for chatMessage
    socket.on('chatMessage', (data) => {
        
        socket.broadcast.to(data.roomId).emit('message',{user:data.user , msg: data.msg, photo: data.photoUrl});
    })

    // listen for status of change role
    socket.on('roleStatus', (data) => {
        const {userId, roomId, role_id} = data
        changeRoleId(userId, roomId, role_id);
        const listOfUsers = getRoomUsers(roomId);
        io.in(roomId).emit('roleStatus');
        io.in(roomId).emit('listOfUsers', listOfUsers)
    })

    socket.on('changeListOfBoards', (data) => {
        socket.to(data.roomId).emit('changeListOfBoards', data, );
    })

    socket.on('disconnect', () => {
        console.log('user off');
        const user = getCurrentUser(socket.id);
        if(user) {
            Rooms.decreaseRoom(user.room);
            userLeave(socket.id);
            listOfUsers = getRoomUsers(user.room);
            io.in(user.room).emit('listOfUsers', listOfUsers);
            console.log('user leave');
        }
    })
}



io.on('connection', onConnection);

// Routers
const roomRouter = require('./routes/room.route');
app.use('/rooms', roomRouter);
const postRouter = require('./routes/board.route');
app.use('/boards', postRouter);
const usersRouter = require('./routes/user.route');
app.use('/users', usersRouter);
const participateRouter = require('./routes/participation.route');
app.use('/participations', participateRouter);

const PORT = process.env.PORT || 8080;

db.sequelize.sync().then(() => {
    server.listen(PORT, () => {
        console.log(`Server  running on port ${PORT}`);
    })
})

