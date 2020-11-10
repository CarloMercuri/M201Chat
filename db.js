const mysql = require('mysql');
const usersData = [];
const activeUsers = [];
const messageHistory =  [];

const database = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '1h24w87lm',
    database : 'm201webchat'
});


function updateUserName(address, username) {
    const uIndex = usersData.findIndex(user => user.address === address);
    const color = hashStringToColor(username);

    if(uIndex !== -1) {
        usersData[uIndex].userName = username;
        usersData[uIndex].userColor = color;

        const auIndex = activeUsers.findIndex(user => user.uniqueID === usersData[uIndex].uniqueID);

        if (auIndex !== -1) {
        activeUsers[auIndex].userName = username;
        activeUsers[auIndex].userColor = color;
        }
    }
}

function removeActiveUser(address) {

    let index = activeUsers.findIndex(user => user.uniqueID === getUserID(address));

    if(index !== -1)
    {
        activeUsers.splice(index, 1);
    }
       
}

function updateUserSocket(address, newSocket) {

    let index = usersData.findIndex(user => 
        user.address === address);

        if(index !== -1) {
            usersData[index].socket = newSocket;
        }
}

function removeUserData(address) {
    const index = usersData.findIndex(user => user.address === address);
   
    if (index !== -1) {
      usersData.splice(index, 1);
    }

}

function resetMessages() {
    messageHistory.splice(0, messageHistory.length);
    return messageHistory;
}

function addActiveUser(user) {
    let index = activeUsers.findIndex(auser => auser.uniqueID === user.uniqueID);

   
    if(index === -1) {
        const activeUser = {userName:user.userName, userColor:user.userColor,
            uniqueID:user.uniqueID, userAuth:user.authLevel}

        activeUsers.push(activeUser);
        return activeUser;
    } else {
        return activeUsers[index];
    }
   
}

function addUserData(socket, userName, authLevel) {
    const userColor = hashStringToColor(userName);
    const address = socket.handshake.address;
    const uniqueID = generateUniqueID();
    const user = {address, userName, authLevel, userColor, uniqueID, socket};
    usersData.push(user);
    return user;
}

function randomHsl() {
    return "hsl(" + 360 * Math.random() + ',' +
    (25 + 50 * Math.random()) + '%,' + 
    (85 + 10 * Math.random()) + '%)'
}

function randomColor() {
    "use strict";
  
    const randomInt = (min, max) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
  

    var h = randomInt(0, 360);
    var s = randomInt(42, 98);
    var l = randomInt(40, 90);
    return `hsl(${h},${s}%,${l}%)`;

}

function hashStringToColor(str) {
    return randomColor();
}

function getMessageHistory() {
    return messageHistory;
}

function getUsersList() {

    return activeUsers;
}

function addMessage(username, message, usercolor, userID) {
    const msg = {username, message, usercolor, userID};
    messageHistory.push(msg);
}

 function generateUniqueID() {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2);
  };

function getUserData(address) {
    return usersData.find(user => user.address === address);
}

function getUserID(address) {
    user = usersData.find(user => user.address === address);

    //return usersData.find(user => user.address === address).uniqueID;
    if(user) {
        return user.uniqueID;
    }

}

function getActiveUser(address) {
    user = activeUsers.find(user => user.uniqueID === getUserID(address));
    if(user)
    {
        return user;
    } else {
        return null;
    }
    
}

function getUserFromIP(address) {
    console.log(address);
}

function addUserToDB(address) {
    
}



module.exports = {
    addUserData,
    getUserData,
    getUserID,
    updateUserName,
    addMessage,
    getMessageHistory,
    updateUserSocket,
    removeUserData,
    getUsersList,
    resetMessages,
    addActiveUser,
    removeActiveUser,
    getActiveUser
}


