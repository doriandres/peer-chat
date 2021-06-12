/**
 * guest.js
 */

const hostIdInput = document.getElementById('host-id');
const hostJoinButton = document.getElementById('host-join');
const chatNameInput = document.getElementById('chat-name');
const chatColorInput = document.getElementById('chat-color');
const chatTextInput = document.getElementById('chat-text');
const chatSendButton = document.getElementById('chat-send');
const chatContentElement = document.getElementById('chat-content');
const peer = new Peer();
const messages = [];

const urlParams = new URLSearchParams(document.location.search.substring(1))

function connect() {
    const id = hostIdInput.value || urlParams.get("code");
    if (!id) return;
    hostJoinButton.removeEventListener('click', connect);
    hostJoinButton.innerText = "Connecting...";
    hostIdInput.setAttribute('disabled', 'true');
    hostIdInput.setAttribute('value', id);
    hostJoinButton.setAttribute('disabled', 'true');
    const hostConnection = peer.connect(id);
    hostConnection.on('open', () => {
        hostJoinButton.innerText = "Connected";
        chatTextInput.addEventListener('keypress', (event) => {
            if(event.key !== "Enter" && !event.shiftKey) return;
            sendMessage(hostConnection);
        })
        chatSendButton.addEventListener('click', () => {
            sendMessage(hostConnection);
        });
    });
    hostConnection.on('data', (message) => {
        addMessage(JSON.parse(message));
    });
    hostConnection.on('close', () => {
        alert('Host has finished the chat');
        reload();
    });
    hostConnection.on('error', (error) => {
        alert(error.toString());
        reload();
    });    
}

function sendMessage(hostConnection){
    const message = chatTextInput.value;
    if(!message) return;
    chatTextInput.value = "";
    hostConnection.send(JSON.stringify({
        content : message,
        from: chatNameInput.value || 'Anonymous',
        color: chatColorInput.value,
        time: new Date().toLocaleTimeString()
    }));
}

function addMessage(message) {
    messages.unshift(message);
    displayMessages();    
}

function displayMessages(){
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

function reload(){
    window.location = window.location;
}

peer.on('open', () => {
    if(urlParams.get("code")){
        connect();
    }else{
        hostJoinButton.addEventListener('click', connect);
    }
})

// if(urlParams.get("code")){
//     setTimeout(connect, 1000);    
// }