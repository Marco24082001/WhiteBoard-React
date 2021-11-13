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

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));

function onConnection(socket){
    console.log("user online");
    socket.on('joinRoom', ({roomId, username}) => {
        // console.log(roomId);
        console.log(socket.id);
        if(Rooms.checkCount(roomId)) {
            // console.log(socket.id);
            socket.join(roomId);
            Rooms.increaseRoom(roomId);
            userJoin(socket.id, username, roomId);
            socket.broadcast.in(roomId).emit('share-data', 'a person has joined the board');
        }
        else socket.emit('error', 'Board is full');
    })  

    // listen for canvas-data
    socket.on('canvas-data', (data) => {
        socket.to(data.roomId).emit('canvas-data', data.base64ImageData);
    })

    socket.on('refresh', (data) => {
        socket.to(data.roomId).emit('refresh', data);
    })

    // listen for chatMessage
    socket.on('chatMessage', (data) => {
        
        socket.broadcast.to(data.roomId).emit('message',{user:data.user , msg: data.msg});
    })

    socket.on('disconnect', () => {
        console.log('user off');
        const user = getCurrentUser(socket.id);
        if(user) {
            Rooms.decreaseRoom(user.room);
            console.log('user leave');
            socket.broadcast.to(user.room).emit('message', {user:'others', msg: 'bye'});
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

