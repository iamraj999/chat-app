const socket = io();

socket.on('message', (msg) => {
    console.log(msg)
});

const form = document.querySelector('#msgForm');

form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const msg = document.querySelector('#usermsg');
    socket.emit('sendMessage',msg.value)
    msg.value ='';
})