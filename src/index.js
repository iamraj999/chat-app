const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

let count = 0;
io.on('connection', (socket) => {
    //console.log('new websocket connection')
    socket.emit('message', 'Welcome');
    socket.broadcast.emit('message', 'A new user has joined');

    socket.on('sendMessage', msg => {
        io.emit('message',msg)
    })
    socket.on('disconnect', ()=>{
        io.emit('message', 'An user has left');
    })
})



server.listen(port, () => {
    console.log('Server is up on ' + port)
})