const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
    generateMessage,
    generateLocationMessage,
    generateImageMessage
} = require('./utils/messages');
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('./utils/users');


const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    //join room
    socket.on('join', ({
        username,
        room
    }, callback) => {
        const {
            error,
            user
        } = addUser({
            id: socket.id,
            username,
            room
        });

        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMessage('Admin', 'Admin', 'Welcome', 'admin', ""));
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', 'Admin', `${user.displayName} has joined`, 'admin', ""));

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room),
            roomDisplayName: user.roomDisplayName
        })
        callback();
    })
    //console.log('new websocket connection')

    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id);
        if (user) {
            const filter = new Filter()
            if (filter.isProfane(msg)) {
                return callback('Profanity not allowed');
            }
            socket.emit('message', generateMessage(user.displayName, user.username, msg, 'sender', user.color));
            socket.broadcast.to(user.room).emit('message', generateMessage(user.displayName, user.username, msg, 'receiver', user.color));
            //io.to(user.room).emit('message', generateMessage(user.displayName, user.username, msg));
            callback('delivered!');
        }
    })
    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        socket.emit('locationMessage', generateLocationMessage(user.displayName, user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`, 'sender', user.color));
        socket.broadcast.to(user.room).emit('locationMessage', generateLocationMessage(user.displayName, user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`, 'receiver', user.color));
        //io.to(user.room).emit('locationMessage', generateLocationMessage(user.displayName, user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`, user.displayName))
        callback();
    })

    socket.on('base64 file', (image, callback) => {
        const user = getUser(socket.id);
        socket.emit('image', generateImageMessage(user.displayName, user.username, image.file, 'sender', user.color));
        socket.broadcast.to(user.room).emit('image', generateImageMessage(user.displayName, user.username, image.file, 'receiver', user.color));
        callback()
    })


    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', 'Admin', `${user.displayName} has left!`, 'admin', ""));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room),
                roomDisplayName: user.roomDisplayName
            })
        }
    })
})




server.listen(port, () => {
    console.log('Server is up on ' + port)
})