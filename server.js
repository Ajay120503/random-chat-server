// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'https://random-chat-eight.vercel.app/', // Vite's default dev server port
        methods: ['GET', 'POST']
    }
});

app.get('/', (req, res) => {
    res.send('Server is working!'); // Respond with a message
});

let userCount = 0;

io.on('connection', (socket) => {
    console.log('A user connected');

    userCount++;
    io.emit('userCount', userCount);

    // Emit a user joined event
    socket.broadcast.emit('userJoined', { userId: socket.id });

    socket.on('message', (message) => {
        io.emit('message', message); // Broadcast the message to all clients
    });

    socket.on('disconnect', () => {
        userCount--;
        console.log('A user disconnected');
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
