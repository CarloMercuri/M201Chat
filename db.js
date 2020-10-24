const mysql = require('mysql');
const users = [];
const activeUsers = [];
const clientSockets = [];
const messageHistory =  [];

const database = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '1h24w87lm',
    database : 'm201webchat'
});


function updateUserName(address, username) {
    const uIndex = users.findIndex(user => user.address === address);
    const color = hashStringToColor(username);

    if(uIndex !== -1) {
        users[uIndex].userName = username;
        users[uIndex].userColor = color;

        const auIndex = activeUsers.findIndex(user => user.uniqueID === users[uIndex].uniqueID);

        if (auIndex !== -1) {
        activeUsers[auIndex].userName = username;
        activeUsers[auIndex].userColor = color;
        }
    }


    

}

function removeActiveUser(address) {

    let uindex = users.findIndex(user =>
        user.address === address);

        if(uindex !== -1) {
            let auindex = users.findIndex(auser => auser.uniqueID === users[uindex].uniqueID);
            if(auindex !== -1) {
                activeUsers.splice(index, 1);
            }
            
            
        }

        const clientsIndex = clientSockets.findIndex(client =>
            client.handshake.address === address);

            if(clientsIndex !== -1) {
                clientSockets.splice(clientsIndex, 1);
            }
}



function updateUserSocket(address, newSocket) {

    let index = clientSockets.findIndex(client => 
        client.handshake.address === address);

        if(index !== -1) {
            clientSockets[index].socket = newSocket;
        } else {
            clientSockets.push(newSocket);
        }

}

function removeUser(address) {
    const usersIndex = users.findIndex(user => user.address === address);
    const clientsIndex = clientSockets.findIndex(client =>
         client.handshake.address === address);
    if (usersIndex !== -1) {
      users.splice(usersIndex, 1);
    }

    if(clientsIndex !== -1) {
        clientSockets.splice(clientsIndex, 1);
    }
}

function resetMessages() {
    messageHistory.splice(0, messageHistory.length);
    return messageHistory;
}

function addActiveUser(user) {
    let index = activeUsers.findIndex(auser => auser.uniqueID === user.uniqueID);

    const activeUser = {userName:user.userName, userColor:user.userColor,
                        uniqueID:user.uniqueID}

    if(index === -1) {
        activeUsers.push(activeUser);
    }
   
}


function addUser(socket, userName, authLevel) {
    const userColor = hashStringToColor(userName);
    const address = socket.handshake.address;
    const uniqueID = generateUniqueID();
    const user = {address, userName, authLevel, userColor, uniqueID};
    users.push(user);
    clientSockets.push(socket);
}

function hashStringToColor(str) {
    var newStr = str.concat(str, generateUniqueID());
    var hash = djb2(newStr);
    var r = (hash & 0xFF0000) >> 16;
    var g = (hash & 0x00FF00) >> 8;
    var b = hash & 0x0000FF;
    return "#" + ("0" + r.toString(16)).substr(-2) + ("0" + g.toString(16)).substr(-2) + ("0" + b.toString(16)).substr(-2);
  }

  function djb2(str){
    var hash = 5381;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
    }
    return hash;
  }
function getMessageHistory() {
    return messageHistory;
}

function getUsersList() {

    return activeUsers;
}

function addMessage(username, message, usercolor) {
    const msg = {username, message, usercolor};
    messageHistory.push(msg);
}

 function generateUniqueID() {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2);
  };

function getUser(address) {
    return users.find(user => user.address === address);
}

function getActiveUser(uID) {
    return activeUsers.find(user => user.uniqueID === uID);
}

function getUserFromIP(address) {
    console.log(address);
}

function addUserToDB(address) {
    
}



module.exports = {
    addUser,
    getUser,
    updateUserName,
    addMessage,
    getMessageHistory,
    updateUserSocket,
    removeUser,
    getUsersList,
    resetMessages,
    addActiveUser,
    removeActiveUser,
    getActiveUser
}


