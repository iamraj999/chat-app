const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage, generateLocationMessage} = require('./utils/messages');


const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

let count = 0;
io.on('connection', (socket) => {
    //console.log('new websocket connection')
    socket.emit('message', generateMessage('Welcome'));
    socket.broadcast.emit('message', generateMessage('A new user has joined'));

    socket.on('sendMessage', (msg, callback) => {
        const filter = new Filter()
        if(filter.isProfane(msg)){
            return callback('Profanity not allowed');
        }
        io.emit('message', generateMessage(msg));
        callback('delivered!');
    })
    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback();
    })
    socket.on('disconnect', () => {
        io.emit('message', generateMessage('An user has left'));
    })
})



server.listen(port, () => {
    console.log('Server is up on ' + port)
})