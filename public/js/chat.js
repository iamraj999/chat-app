const socket = io();

//Elements

const form = document.querySelector('#message-form');
const userMessage = document.querySelector('#usermsg');
const button = form.querySelector('button');
const messages = document.querySelector('#messages');

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//QS
const {
    username,
    room
} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});
const autoScroll = () => {
    //new message element
    const $newMessage = messages.lastElementChild
    // height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // visible height
    const visibleheight = messages.offsetHeight;
    // height of messages container
    const containerheight = messages.scrollHeight;
    //how far i scrolled
    const scrollOffset = messages.scrollTop + visibleheight;

    if(containerheight - newMessageHeight <= scrollOffset){
        messages.scrollTop = messages.scrollHeight
    }
}


socket.on('message', (message) => {
    console.log(message.text)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a'),
        displayName: message.displayName
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('locationMessage', (message) => {
    console.log(message.url)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a'),
        displayName: message.displayName
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

socket.on('roomData', ({
    users,
    room,
    roomDisplayName
}) => {
    const html = Mustache.render(sidebarTemplate, {
        room: room,
        users: users,
        roomDisplayName:roomDisplayName
    });
    document.querySelector('#sidebar').innerHTML = html;
})


form.addEventListener('submit', (e) => {
    e.preventDefault();
    button.setAttribute('disabled', 'disabled')
    socket.emit('sendMessage', userMessage.value, (error) => {
        button.removeAttribute('disabled');
        button.focus();
        if (error) {
            return console.log(error)
        }
        console.log('The msg was delivered!')
    })
    userMessage.value = '';
    userMessage.focus();

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

socket.emit('join', {
    username,
    room
}, (error) => {
    if (error) {
        alert(error)
        location.href = '/';
    }
});

socket.on('roomData', ({
    room,
    users
}) => {
    console.log(users)

})