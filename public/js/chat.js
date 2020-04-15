const socket = io();

const form = document.querySelector('#message-form');
const msg = document.querySelector('#usermsg');
const button = form.querySelector('button');
const messages = document.querySelector('#messages');

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML


socket.on('message', (message) => {
    console.log(message.text)
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    messages.insertAdjacentHTML('beforebegin', html);
});

socket.on('locationMessage', (message) => {
    console.log(message.url)
    const html = Mustache.render(locationMessageTemplate, {
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    messages.insertAdjacentHTML('beforebegin', html);
})


form.addEventListener('submit', (e) => {
    e.preventDefault();
    button.setAttribute('disabled', 'disabled')
    socket.emit('sendMessage', msg.value, (error) => {
        button.removeAttribute('disabled');
        button.focus();
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
        locationButton.setAttribute('disabled', 'disabled')
        navigator.geolocation.getCurrentPosition((position) => {
            socket.emit('sendLocation', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }, () => {
                locationButton.removeAttribute('disabled')
                console.log('location shared')
            })

        })
    } else {
        alert('Geolocation is not supported by your browser')
    }
})