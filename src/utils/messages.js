const generateMessage = (displayName, username, text, className, color) => {
    return {
        username: username,
        text: text,
        createdAt: new Date().getTime(),
        displayName: displayName,
        className: className,
        color
    }
}

const generateLocationMessage = (displayName, username, url, className, color) => {
    return {
        username,
        url: url,
        createdAt: new Date().getTime(),
        displayName: displayName,
        className: className,
        color
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}