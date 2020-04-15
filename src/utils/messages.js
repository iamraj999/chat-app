const generateMessage = (username, text,displayName) => {
    return {
        username: username,
        text: text,
        createdAt: new Date().getTime(),
        displayName: displayName
    }
}

const generateLocationMessage = (username, url, displayName) => {
    return {
        username,
        url: url,
        createdAt: new Date().getTime(),
        displayName: displayName
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}