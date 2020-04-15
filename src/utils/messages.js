const generateMessage = (displayName,username, text) => {
    return {
        username: username,
        text: text,
        createdAt: new Date().getTime(),
        displayName: displayName
    }
}

const generateLocationMessage = (displayName,username, url) => {
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