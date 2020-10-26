const socket = io();
let username = '';
let unreadMessages = 0;
let showLeaveJoinMsg = true;
const documentTitle = 'M1 201 WebChat';
const chatForm = document.getElementById('chatInput');
let activeUsersList = [];

const msgContainer = document.getElementById('chatOutput');
const usersContainer = document.getElementById('chatUsers');
const chatInputContainer = document.getElementById('chatInputContainer');
const chatDivColor1 = "#777";
const chatDivColor2 = "#666";
let selectedChatDivColor = "#666";

var urlRegex =/(((https?:\/\/)|(www\.))[^\s]+)/g;
var smileyRegex =/:O|:P|:D|:\||:S|:\$|:@|8o\||\+o\(|\(H\)|\(C\)|\(\?\)/g






//const smileys = JSON.parse(smileysDB);

window.addEventListener('focus', onFocus);

function onFocus() {
    document.title = documentTitle;
    unreadMessages = 0;
}

socket.on('message', message => {
    //console.log(message);
    socket.emit('Reply', 'Ack');
})

socket.on('USER_DISCONNECT', usersList => {
    refreshUsersList(usersList);
})

socket.on('AUTH_SUCCESSFUL', () => {
    console.log('AUTH_SUCCESSFUL');
    chatInputContainer.innerHTML = "";
    const chatInputForm = document.createElement('form') ;

    chatInputForm.innerHTML = `<input 
    id="chatMsgInput"
    type="text"
    placeholder="Enter Message..."
    required
    autocomplete="off"
    name="input"
    autofocus
    class="rounded" />`;
    chatInputContainer.appendChild(chatInputForm);
   
    chatInputForm.addEventListener('submit', (e) => {
        // Prevents from being written to a file or something
        e.preventDefault();
     
        const msg = e.target.elements.chatMsgInput.value;
        socket.emit('chatMsgSubmit', msg);
    
        e.target.elements.chatMsgInput.value ='';
    
        
    });
})

socket.on('AUTH_NEEDED', () => {
    chatInputContainer.innerHTML = "";
    const userNameForm = document.createElement('form');

    userNameForm.innerHTML = `<input 
    id="userNameInput"
    type="text"
    placeholder="ENTER USERNAME..."
    required
    autocomplete="off"
    name="input"
    
    class="rounded" />`;
    chatInputContainer.appendChild(userNameForm);

    userNameForm.addEventListener('submit', (e) => {
        // Prevents from being written to a file or something
        //console.log(document.title);
        e.preventDefault();
        const msg = e.target.elements.userNameInput.value;
        socket.emit('USERNAME_SUBMIT', msg);
        e.target.elements.userNameInput.value ='';
    
        
    });

})

socket.on('newMessage', msg => {
    if(!document.hasFocus()) {
        unreadMessages++;
        document.title = `(${unreadMessages})${documentTitle}`;
    }
        appendMessage(msg);
})

socket.on('CHAT_UPDATE', messageHistory => {
    msgContainer.innerHTML = '';
    messageHistory.forEach(appendMessage);
})

socket.on('USER_JOINED', data => {
    console.log("user joined");
    if(showLeaveJoinMsg) {
        appendLeaveJoinMessage(data.newUser, true);
    }

    refreshUsersList(data.usersList);
    
})

socket.on('USERS_UPDATE', usersList => {
    refreshUsersList(usersList)
})

function refreshUsersList(usersList) {
    usersContainer.innerHTML ='';
    activeUsersList.splice(0, activeUsersList.length);
    activeUsersList = usersList;
    activeUsersList.forEach(appendUser);
}

function appendUser(user) {
    const usersDiv = document.createElement('div');
    usersDiv.className = "userDiv";
    usersDiv.innerHTML = `<span style="color:${user.userColor}">${user.userName}</span>`;
    usersContainer.appendChild(usersDiv);
}

function appendLeaveJoinMessage(user, join) {
    const messageDiv = document.createElement('div');
    
    if (selectedChatDivColor == chatDivColor1) {
        selectedChatDivColor = chatDivColor2;
    } else {
        selectedChatDivColor = chatDivColor1;
    }

    messageDiv.style.background = selectedChatDivColor;

    if(leave) {
        messageDiv.innerHTML = `<p><span style="color:${user.userColor}">${user.userName} </span>: has joined the chat.</p>`;
    } else {
        messageDiv.innerHTML = `<p><span style="color:${user.userColor}">${user.userName} </span>: has left the chat.</p>`;

    }

    msgContainer.appendChild(messageDiv);

    // scroll chat to bottom
    msgContainer.scrollTop = msgContainer.scrollHeight;

}



function formatMessage(msg) {
    // Add the username with color at the start
    var returnString = `<span style="color:${msg.usercolor}">${msg.username} </span>: `

    // emoji
    msg.message = smileyTizeMessage(msg.message)
    // links
    msg.message = hyperLinkaLizeMessage(msg.message);
;

    return returnString.concat(msg.message);
}

function smileyTizeMessage(message) {
    
    message = message.replace(smileyRegex, function(smiley) {
        return 'SMILEY';
    });

    return message;
}

function hyperLinkaLizeMessage(message) {
    message = message.replace(urlRegex, function(url) {
        // If the URL starts with www, then we're going to add
        // http:// ourselves, so it works
        if(url.substring(0, 4) === 'www.') {
            url = 'http://' + url;
        }
        return '<a href="' + url + '" target="_blank">' + url + '</a>';
    });

    return message;
}



function appendMessage(msg) {
    const messageDiv = document.createElement('div');
    
    // Alternate background colors
    if (selectedChatDivColor == chatDivColor1) {
        selectedChatDivColor = chatDivColor2;
    } else {
        selectedChatDivColor = chatDivColor1;
    }

    messageDiv.style.background = selectedChatDivColor;

    // Format the message in HTML
    const formattedMsg = formatMessage(msg);
    // Assign it
    messageDiv.innerHTML = formattedMsg;
    msgContainer.appendChild(messageDiv);

    // scroll chat to bottom
    msgContainer.scrollTop = msgContainer.scrollHeight;

}



