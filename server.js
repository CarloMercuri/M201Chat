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
    user = db.getUser(socket.handshake.address);
    
    if(!user) {
        // If not, we create one with default authlevel and username
        let authLevel = 1;
        if(socket.handshake.address === '::1') {
            authLevel = 2;
        }
        // hi
        db.addUser(socket, '', authLevel); // add base user with base authentication

        // That's not enough to be authenticated. Keeping this process in case
        // of future accounts / permissions system
        socket.emit('AUTH_NEEDED');
    } else {
        // If the profile exists, but there is no previous username attached to it,
        // we promt the user to input his username. authLevel is still only just
        // groundwork for future implementations
        if(user.authLevel === 0 || user.userName === '') {
            socket.emit('AUTH_NEEDED');
        }else{
            // If the user profile exists, and the user has a username to it
            // (basically means it already used the chat before), then
            // we accept the connection and send the other active users
            // the message that he joined

            db.addActiveUser(user);

            socket.emit('AUTH_SUCCESSFUL');
            
            const uJoinStruct = {
                newUser: user,
                usersList: db.getUsersList()
            }

            socket.broadcast.emit('USER_JOINED', uJoinStruct);
            
            // Then we update him with chat messages and active users
            updateUser(socket);
        }
    }

    
    socket.on('disconnect', () => {
        // remove from active users and broadcast the information.
        // Need to look into doing this another way because of page refreshes.
        // Not the end of the world, but annoys me.
        db.removeActiveUser(db.getUser(socket.handshake.address).uniqueID);
            io.emit('USER_DISCONNECT', db.getUsersList());
        
    });

    // This happens in 2 cases:
    // 1) a new ip joins the chat, who needs to choose a username
    // 2) an existing user changes his username
    socket.on('USERNAME_SUBMIT', (username) => {
        
        
        user = db.getUser(socket.handshake.address);

        if(user) {
            db.addActiveUser(user);
        }

        db.updateUserName(socket.handshake.address, username);
        updateUser(socket);
        socket.emit('AUTH_SUCCESSFUL', username);

        const uJoinStruct = {
            newUser: user,
            usersList: db.getUsersList()
        }

        socket.broadcast.emit('USER_JOINED', uJoinStruct);

    });

    socket.on('on-connect-username', (username) => {
        // If agreed
        
        

    });

    // Listens for a chatsubmission
    socket.on('chatMsgSubmit', (msg) => {
        const user = db.getUser(socket.handshake.address);
        //console.log(`${user.userName}: ${msg}`)
        if(msg.charAt(0) === '/') {
            
            if(msg.includes('/reset')) {
                if(user.authLevel === 2)
                {
                    io.emit('CHAT_UPDATE', db.resetMessages());
                }
                

            }

            return;
        }
        
        const msgStruct = {
            username: `${user.userName}`,
            message: msg,
            usercolor: `${user.userColor}`
        }

        db.addMessage(
            msgStruct.username,
            msgStruct.message,
            msgStruct.usercolor
            );


        io.emit('newMessage', msgStruct);
    });
});

function updateUser(socket) {
    db.updateUserSocket(socket.handshake.address, socket);
    socket.emit('CHAT_UPDATE', db.getMessageHistory());
    socket.emit('USERS_UPDATE', db.getUsersList());
}

function authenticateUser(socket) {
    
}

io.on('Reply', message =>{
    console.log('hi');
});