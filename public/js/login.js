const socket = io();
const usernameForm = document.getElementById('loginForm');
let myUsername = '';

usernameForm.addEventListener('submit', (e) => {
    // Prevents from being written to a file or something
    e.preventDefault();
    const msg = e.target.elements.loginInput.value;
    socket.emit('USERNAME_SUBMIT', msg);
    e.target.elements.loginInput.value ='';
})

socket.on('AUTH_NEEDED', () => {
    console.log('AUTH_NEEDED')
})

socket.on('USERNAME_ACCEPTED', username => {
    //localStorage.setItem('m201-myUsername', username);
    window.location.href = "/chat.html";
    main.username = username;
})