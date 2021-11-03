require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const socket = require('socket.io');
const db = require('./models');
const {Rooms} = require('./utils/Rooms');
const {userJoin, getCurrentUser, userLeave} = require('./utils/Users');
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

app.use(express.json())

// function onConnection(socket){
//     console.log("user online");
//     socket.on('canvas-data', (data) => {socket.broadcast.emit('canvas-data', data);});
// }

// function onDisconnect(socket){
//     console.log("user leave");
// }

// function onDisconnect(i){
//     const user = getCurrentUser(i.id);
//     console.log("ra roi");
//     console.log(i);
//     // console.log(user);
//     if(user) {
//         Rooms.DecreaseRoom(user.room);
//         // console.log(user)
//         io.in(user.room).emit('message', `${user.username} is leave`);
//     }
// }

function onConnection(socket){
    console.log("user online");
    socket.on('joinRoom', ({roomId, username}) => {
        console.log(roomId);
        if(Rooms.checkCount(roomId)) {
            console.log(socket.id);
            socket.join(roomId);
            Rooms.increaseRoom(roomId);
            userJoin(socket.id, username, roomId);
            socket.emit('message', 'welcom to white board');
            socket.broadcast.in(roomId).emit('message', 'a person has joined the board');
        }
        else socket.emit('error', 'Board is full');
    })  

    socket.on('canvas-data', (data) => {
        // io.emit('canvas-data', data);
        // console.log(socket.id);
        // console.log(data);
        io.to(data.roomId).emit('canvas-data', data.base64ImageData);
        // io.emit('canvas-data', data);
        // socket.in(data.room.id).broadcast.emit('canvas-data', data);
    })
    socket.on('disconnect', () => {
        const user = getCurrentUser(socket.id);
        if(user) {
        Rooms.decreaseRoom(user.room);
        console.log('user leave');
        io.in(user.room).emit('message', `${user.username} is leave`);
    }
    })
}



io.on('connection', onConnection);

// Routers
const postRouter = require('./routes/Boards')
app.use('/boards', postRouter)
const usersRouter = require('./routes/Users')
app.use('/auth', usersRouter)

const PORT = process.env.PORT || 8080;

db.sequelize.sync().then(() => {
    server.listen(PORT, () => {
        console.log(`Server  running on port ${PORT}`);
    })
})

