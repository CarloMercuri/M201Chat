
const socket = io();
let username = '';
let unreadMessages = 0;
let showLeaveJoinMsg = false;
const documentTitle = 'M1 201 WebChat';
const chatForm = document.getElementById('chatInput');
let messageHistory = [];
let activeUsersList = [];
let myself_userID = '';
let myself_userColor;
let myself_userName = '';


const msgContainer = document.getElementById('chatOutput');
const usersContainer = document.getElementById('chatUsers');
const chatInputContainer = document.getElementById('chatInputContainer');
const chatDivColor1 = "#777";
const chatDivColor2 = "#666";
let selectedChatDivColor = "#666";

var urlRegex =/(((https?:\/\/)|(www\.))[^\s]+)/g;
var smileyRegex =/:O|:P|:D|:\||:S|:\$|:@|8o\||\+o\(|\(H\)|\(C\)|\(\?\)/g


var emojiDB = JSON.parse(emojiDB);







//const smileys = JSON.parse(smileysDB);

window.addEventListener('focus', onFocus);

function onFocus() {
    document.title = documentTitle;
    unreadMessages = 0;
}




socket.on('AUTH_SUCCESSFUL', (user) => {

    myself_userColor = user.userColor;
    myself_userID = user.uniqueID;
    myself_userName = user.userName;

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
        socket.emit('CHAT_MSG_SUBMIT', msg);
    
        e.target.elements.chatMsgInput.value ='';

        console.log(myself_userName);

        const msgStruct = {
            userName: `${myself_userName}`,
            message: msg,
            userColor: `${myself_userColor}`,
            userID: myself_userID
        }
    
        appendMessage(msgStruct);
        
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

socket.on('NEW_CHAT_MESSAGE', msg => {
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

socket.on('USER_JOINED', user => {

    if(showLeaveJoinMsg) {
        appendLeaveJoinMessage(user, true);
    }

    addNewUser(user);
    
})

socket.on('USER_DISCONNECT', user => {
    if(showLeaveJoinMsg) {
        appendLeaveJoinMessage(user, false);
    }

    removeUser(user);
})

socket.on('USERS_UPDATE', usersList => {
    resetUsersList(usersList)
})

function removeUser(user) {
    let index = activeUsersList.findIndex(aUser => aUser.uniqueID === user.uniqueID);

    if(index !== -1) {
        activeUsersList.splice(index, 1);
    }

    refreshUsersList();
    
}

function addNewUser(user) {
    activeUsersList.push(user);
    activeUsersList.sort((a, b) => a.userName.localeCompare(b.userName));
    activeUsersList.forEach((user) => {
        console.log(user.userName);
    })

    refreshUsersList();
}

function resetUsersList(usersList) {
    usersContainer.innerHTML ='';
    activeUsersList.splice(0, activeUsersList.length);
    activeUsersList = usersList;
    activeUsersList.forEach(appendUser);
    
}

function refreshUsersList() {
    usersContainer.innerHTML ='';
    activeUsersList.forEach(appendUser);
}

function appendUser(user) {
    const usersDiv = document.createElement('div');
    const usersBtn = document.createElement('button');

    function userClicked() {
        const dropDown = document.createElement('div');
        dropDown.className = "dropdown-content";
        dropDown.innerHTML = 
        `<a href="#">Link 1</a>
        <a href="#">Link 2</a>
        <a href="#">Link 3</a>`;
        usersBtn.append(dropDown);
        
    }

    usersBtn.onclick = userClicked();
    usersBtn.className = "userButton";
    usersBtn.innerHTML = `<span style="color:${user.userColor}">${user.userName}</span>`;

    usersDiv.append(usersBtn);
    usersDiv.id = "userDiv";
    usersContainer.appendChild(usersDiv);
}

function userClicked() {
    const dropDown = document.createElement('div');
    dropDown.className = "dropdown-content";

    dropDown.innerHTML = 
    `<a href="#">Link 1</a>
    <a href="#">Link 2</a>
    <a href="#">Link 3</a>`;
    
    
}

function appendLeaveJoinMessage(user, join) {
    const bodyDiv = document.createElement('div');
    const messageDiv = document.createElement('div');

    bodyDiv.className = "messageBody";
    messageDiv.className = "messageText";
    
    messageDiv.style.background = selectedChatDivColor;

    if(join) {
        messageDiv.innerHTML = `<span style="color:${user.userColor}">${user.userName} </span>: has joined the chat.`;
    } else {
        messageDiv.innerHTML = `<span style="color:${user.userColor}">${user.userName} </span>: has left the chat.`;

    }
    bodyDiv.appendChild(messageDiv);
    msgContainer.appendChild(bodyDiv);

    // scroll chat to bottom
    msgContainer.scrollTop = msgContainer.scrollHeight;

}

function appendMessage(msg) {

    // Create the elements
    const bodyDiv = document.createElement('div');
    const messageDiv = document.createElement('div');

    bodyDiv.className = "messageBody";
    messageDiv.className = "messageText";

    function createHeader() {
        const headerDiv = document.createElement('div');
        headerDiv.className = "messageHeader";
        headerDiv.innerHTML = `<span style="color:${msg.userColor}">${msg.userName} </span> `;
        bodyDiv.appendChild(headerDiv);
    }

    // If the last received message is from the same user, don't display the
    // header with the username again
    if(messageHistory.length > 0) {

        if(messageHistory[messageHistory.length - 1].userID != msg.userID) {
            createHeader();
        }
    } else {
        createHeader();
    }

    // Format the message in HTML
    messageDiv.innerHTML = formatMessage(msg);
    
    bodyDiv.appendChild(messageDiv);
    msgContainer.appendChild(bodyDiv);
    
    // scroll chat to bottom
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // Add meesage to the local history
    messageHistory.push(msg);

}


function formatMessage(msg) {

    /* 
    var emojIndexes = findEmojis(msg.message);
    // returns an array of objects with .index and .lastIndex properties
    var htmlIndexes = findHyperLinks(msg.message);

    htmlIndexes.forEach((ind) => {
        console.log(`index: ${ind.index}, lastindex: ${ind.lastIndex}`);
    });
    */

    // emoji
    msg.message = smileyTizeMessage(msg.message)
    // links
    msg.message = hyperLinkaLizeMessage(msg.message);


    return msg.message;
}

function findEmojis(message) {

}

function findHyperLinks(message) {
    var returnArray = [];
    var index;
    var lastIndex;
    var array1;
    while ((array1 = urlRegex.exec(message)) !== null) {
        //console.log(`Found ${array1[0]} at ${array1.index}. Next starts at ${urlRegex.lastIndex}.`);
        index = array1.index;
        lastIndex = urlRegex.lastIndex;
        var obj = {index, lastIndex};
        returnArray.push(obj);

      }

      return returnArray;
}

function smileyTizeMessage(message) {
    
    message = message.replace(smileyRegex, function(smiley) {
        return `<img src="emoji/angry.png" width=15 height=15 alt="angry"></img>`;
        //return 'SMILEY';
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







