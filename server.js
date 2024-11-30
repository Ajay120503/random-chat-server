const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'https://random-chat-liard.vercel.app/', // Vite's default dev server port
        methods: ['GET', 'POST']
    }
});

app.get('/', (req, res) => {
    res.send('Server is working!'); // Respond with a message
});

let userCount = 0;
let messages = []; // Store messages in memory (you can use a database in production)

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    userCount++;
    io.emit('userCount', userCount); // Emit user count to all clients

    // Notify others when a new user joins
    socket.broadcast.emit('userJoined', { userId: socket.id });

    // Send previous messages when a new user connects
    socket.emit('previousMessages', messages);

    // Handle incoming message from a client
    socket.on('message', (message) => {
        messages.push(message); // Store message in memory
        io.emit('message', message); // Broadcast the message to all clients
    });

    // Handle typing indicator
    socket.on('typing', () => {
        socket.broadcast.emit('typing'); // Notify others that the user is typing
    });

    // Handle reactions to messages (e.g., emoji reactions)
    socket.on('reaction', (reaction) => {
        console.log('Reaction received:', reaction);
        io.emit('reaction', reaction); // Broadcast the reaction to all clients
    });

    // User disconnected
    socket.on('disconnect', () => {
        userCount--;
        console.log('A user disconnected:', socket.id);
        io.emit('userCount', userCount); // Update user count for all clients
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
