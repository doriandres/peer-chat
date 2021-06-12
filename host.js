/**
 * host.js
 */

const hostIdlabel = document.getElementById('host-id');
const chatNameInput = document.getElementById('chat-name');
const chatColorInput = document.getElementById('chat-color');
const chatTextInput = document.getElementById('chat-text');
const chatSendButton = document.getElementById('chat-send');
const chatContentElement = document.getElementById('chat-content');
const guestConnections = [];
const messages = [];
const peer = new Peer();

peer.on('open', (id) => {    
    hostIdlabel.innerHTML = `
        <p>Room Code: ${id}</p>
        <a href="guest.html?code=${id}" target="_blank">Link to Join</a>
    `;
    chatTextInput.addEventListener('keypress', (event) => {
        if (event.key !== "Enter" && !event.shiftKey) return;
        sendMessage();
    })
    chatSendButton.addEventListener('click', () => {
        sendMessage();
    });
});

peer.on('connection', (guestConnection) => {
    guestConnections.push(guestConnection);
    guestConnection.on('data', (message) => {
        addMessage(JSON.parse(message));
    });
});

function sendMessage() {
    const message = (chatTextInput.value || '').trim();
    if (!message) return;
    chatTextInput.value = "";
    addMessage({
        content: message,
        from: chatNameInput.value || 'Anonymous',
        color: chatColorInput.value,
        time: new Date().toLocaleTimeString()
    });
}

function addMessage(message) {
    messages.unshift(message);
    displayMessages();
    notifyGuests(message);
}

function notifyGuests(message) {
    guestConnections.forEach(guestConnection => {
        guestConnection.send(JSON.stringify(message));
    });
}

function displayMessages() {
    requestAnimationFrame(() => {
        const chatContent = messages.map(message => `
            <p>
                <b style="color:${message.color};">${message.from} (<i>${message.time}</i>):</b>
                <span>${message.content}</span>
            </p>
        `).join('');
        chatContentElement.innerHTML = chatContent;
    });
}
