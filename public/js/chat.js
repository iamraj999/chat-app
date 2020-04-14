const socket = io();

socket.on('message', (msg) => {
    console.log(msg)
});

const form = document.querySelector('#msgForm');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = document.querySelector('#usermsg');
    socket.emit('sendMessage', msg.value, (error) => {
        if (error) {
            return console.log(error)
        }
        console.log('The msg was delivered!')
    })
    msg.value = '';
})

const locationButton = document.querySelector('#send-location');

locationButton.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            socket.emit('sendLocation', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }, () => {
                console.log('location shared')
            })

        })
    } else {
        alert('Geolocation is not supported by your browser')
    }
})