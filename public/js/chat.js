const socket = io();

//Elements

const form = document.querySelector('#message-form');
const userMessage = document.querySelector('#usermsg');
const sendButton = document.querySelector('#send-message');
const messages = document.querySelector('#messages');
const imageButton = document.querySelector("#imageButton")
const imageField = document.querySelector('#image');
const isUserstyping = document.querySelector('#isUserstyping_container');

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
const imageMessageTemplate = document.querySelector('#image-template').innerHTML
const messageTypingTemplate = document.querySelector('#message-typing-template').innerHTML
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

    if (containerheight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }
}

socket.on('typing', (typingUsers) => {
    const html = Mustache.render(messageTypingTemplate, {
        isTyping: function () {
            const typers = typingUsers.filter(user => {
                return user.isTyping && user.id !== socket.id;
            })
            return typers.length > 0;
        },
        message: function () {
            const typers = typingUsers.filter(user => {
                return user.isTyping && user.id !== socket.id;
            })
            let socketMsg = '';
            if (typers.length > 0) {
                socketMsg = typers.length === 1 ? `${typers[0].displayName} is typing` : `${typers[0].displayName} and ${typers.length -1} others are typing`
            }
            return socketMsg;
        }
    });
    isUserstyping.innerHTML = '';
    isUserstyping.insertAdjacentHTML('beforeend', html);
});

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a'),
        displayName: message.displayName,
        className: message.className,
        color: message.color,
        isReceiver: function () {
            return message.className === 'receiver' || message.className === 'admin';
        }
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});
socket.on('image', (message) => {
    const html = Mustache.render(imageMessageTemplate, {
        username: message.username,
        file: message.file,
        createdAt: moment(message.createdAt).format('h:mm a'),
        displayName: message.displayName,
        className: message.className,
        color: message.color,
        isReceiver: function () {
            return message.className === 'receiver';
        },
        fileClass: function () {
            return message.fileName.match(/\.(png|PNG)$/) ? 'pngimage' : "";
        }
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
});

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a'),
        displayName: message.displayName,
        className: message.className,
        color: message.color,
        isReceiver: function () {
            return message.className === 'receiver';
        }
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
        roomDisplayName: roomDisplayName
    });
    document.querySelector('#sidebar').innerHTML = html;
})

userMessage.addEventListener('keyup', (e) => {
    if (e.target.value) {
        socket.emit('is typing', true);
    } else {
        socket.emit('removeTypers', false);
    }
});


form.addEventListener('submit', (e) => {
    e.preventDefault();
    sendButton.setAttribute('disabled', 'disabled')
    socket.emit('sendMessage', userMessage.value, (error) => {
        socket.emit('is typing', false);
        sendButton.removeAttribute('disabled');
        if (error) {
            return console.log(error)
        }
        console.log('The msg was delivered!')
    })
    userMessage.value = '';
    userMessage.focus();

})
// userMessage.addEventListener('focus', () => {
//     autoScroll();
// })

const locationButton = document.querySelector('#send-location');

locationButton.addEventListener('click', () => {
    if (navigator.geolocation) {
        locationButton.setAttribute('disabled', 'disabled');
        try {
            navigator.geolocation.getCurrentPosition((position) => {
                socket.emit('sendLocation', {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }, () => {
                    locationButton.removeAttribute('disabled')
                    console.log('location shared')
                })

            })
        } catch (error) {
            locationButton.removeAttribute('disabled');
            if (window.confirm('Geolocation is not supported with http urls. Try reloading with secure url. If you click "ok" you would be redirected')) {
                window.location.href = document.location.href.replace("http", "https");
            };
        }
    } else {
        alert(`Geolocation is not supported by your browser`)
    }
})

socket.emit('join', {
    username,
    room
}, (error) => {
    if (error) {
        if (error.indexOf('User Name is required to join ') === 0) {
            const name = prompt('Enter your username!');
            const room = error.replace('User Name is required to join ', '');
            if (name) {
                location.href = `/chat.html?username=${name}&room=${room}`
            } else {
                location.href = '/';
            }
        } else {
            alert(error)
            location.href = '/';
        }
    }
});

socket.on('roomData', ({
    room,
    users
}) => {
    console.log(users)

})

imageField.addEventListener('change', function (e) {
    imageButton.setAttribute('disabled', 'disabled');
    var data = e.target.files[0];
    let size = data.size;
    if (size > 3000000) {
        alert('File size exceeds 3MB, Choose different image');
        imageField.value = '';
        imageButton.removeAttribute('disabled');
    } else {
        readThenSendFile(data);
    }

});

function readThenSendFile(data) {
    var reader = new FileReader();
    reader.onload = function (evt) {
        var msg = {};
        msg.file = evt.target.result;
        msg.fileName = data.name;
        socket.emit('base64 file', msg, () => {
            imageField.value = '';
            imageButton.removeAttribute('disabled');
        });
    };
    reader.readAsDataURL(data);
}