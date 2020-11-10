// REQUIRES
const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const db = require('./db');

// SETUP
const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));



io.on('connection', socket => {

    // Basically check if the IP address has a user profile to it
    userData = db.getUserData(socket.handshake.address);
    
    if(!userData) {
        socket.emit('AUTH_NEEDED');
    } else{
            // If the user profile exists, and the user has a username to it
            // (basically means it already used the chat before), then
            // we accept the connection and send the other active users
            // the message that he joined

            const aUser = db.addActiveUser(user);

            socket.emit('AUTH_SUCCESSFUL', aUser);
            
            socket.broadcast.emit('USER_JOINED', aUser);
            
            // Then we update him with chat messages and active users
            getUserUpToDate(socket);
        }


    
    socket.on('disconnect', () => {
        // remove from active users and broadcast the information.
        // Need to look into doing this another way because of page refreshes.
        // Not the end of the world, but annoys me.
        user = db.getActiveUser(socket.handshake.address);

        if(user) {
            io.emit('USER_DISCONNECT', user);
            db.removeActiveUser(socket.handshake.address);
        }
 
    });

    socket.on('USERNAME_CHANGE', (username) => {
        db.updateUserName(socket.handshake.address, username);
        let user = db.getActiveUser(socket.handshake.address);

        socket.broadcast.emit('USER_NAME_CHANGE', user);

    });

    // This happens with the initial name submit, where the user is not yet
    // added to usersData
    socket.on('USERNAME_SUBMIT', (username) => {

        let authLevel = 1;

        if(socket.handshake.address === '::1') {
            authLevel = 2;
        }

        let userData = db.addUserData(socket, username, authLevel); // add base user with base authentication
        let user = db.addActiveUser(userData);


        socket.emit('AUTH_SUCCESSFUL', user);

        socket.broadcast.emit('USER_JOINED', user);
        getUserUpToDate(socket);

    });

    // Listens for a chatsubmission
    socket.on('CHAT_MSG_SUBMIT', (msg) => {

        let activeUser = db.getActiveUser(socket.handshake.address);

        // the users always need to get authorization first (aka choose a username)
        // but... you never know
        if(!activeUser) {
            console.log("Unauthorized user");
            return;
        }

        

        if(msg.charAt(0) === '/') {

            if(msg.substring(1, 6) === "reset")
            {
                if(user.authLevel === 2)
                {
                    io.emit('CHAT_UPDATE', db.resetMessages());
                }
            }

            if(msg.substring(1, 6) === "admin" && msg.charAt(6) === ' ') {
                if(msg.substring(7) === "adminpw") {
                    const user = db.getUserData(socket.handshake.address);
                    user.authLevel = 2;
                }
            }


            return;
        }
        
        const msgStruct = {
            userName: `${activeUser.userName}`,
            message: msg,
            userColor: `${activeUser.userColor}`,
            userID: activeUser.uniqueID
        }

        db.addMessage(
            msgStruct.userName,
            msgStruct.message,
            msgStruct.userColor,
            msgStruct.userID
            );

        socket.broadcast.emit('NEW_CHAT_MESSAGE', msgStruct);

    });
});

function getUserUpToDate(socket) {
    socket.emit('CHAT_UPDATE', db.getMessageHistory());
    socket.emit('USERS_UPDATE', db.getUsersList());
}


