import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
// const jwt = require('jsonwebtoken');
import jwtWebToken from 'jsonwebtoken';
import db from './database/db.js';

// const UserRoute = require('./routes/UserRoute.js');
import UserRoute from './routes/UserRoute.js';
import MessageRoute from './routes/MessegeRoute.js';

const app = express();
app.use(cors({
    origin: '*'
}));
const server = createServer(app);
const io = new Server(server, {
    cors:
    {
        origin: '*',
    }
});

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    // // console.log(token);

    if (!token) {
        // // console.log('Authentication error');
        return next(new Error('Authentication error'));
    }
    try {
        const decoded = jwtWebToken.verify(token.toString(), process.env.JWT_SECRET);
        // console.log(decoded);
        socket.user = decoded;
        next();
    }
    catch (err) {
        // // console.log(err);
        return next(new Error('Authentication error'));
    }
})

io.on('connection', (socket) => {
    console.log('User connected');
    console.log('connected user - ', socket.id, socket.user);

    let query = `update userTable set roomId = ? where email = ?`;
    let params = [socket.id, socket.user.email];

    db.query(query, params, (err, result) => {
        if (err) // console.log(err);
            console.log(result);
    })

    // socket.on('disconnect', () => {
    //     // // console.log('User disconnected - ', socket.id);
    // });

    io.emit('joining', 'hello');

    socket.on('message', (data) => {
        console.log(data);
        // socket.broadcast.emit('receivedMessage', data);
        socket.to(data.receipentRoom).emit('receivedMessage', data);

        let channelKey = "";

        if (data.receipent < data.sender) {
            channelKey = `${data.receipent}-${data.sender}`;
        }
        else {
            channelKey = `${data.sender}-${data.receipent}`;
        }

        let saveMessageQuery = `INSERT INTO messages (id, channelKey, sentBy, sentTo, message, messageTime) VALUES (?, ?, ?, ?, ?, ?)`;

        let params = [data.id, channelKey, data.sender, data.receipent, data.message, data.time];

        db.query(saveMessageQuery, params, (err, result) => {
            if (err) // console.log(err);
                console.log(result);
        });

        console.log(channelKey);

    })

    socket.on('typing', (data) => {
        socket.to(data.receipentRoom).emit('typing', data);
    })
})

app.use(express.json());

app.get('/', (req, res) => {
    res.send(`<h1>Hello Wold!</h1>`);
});

app.use('/user', UserRoute);
app.use('/messages', MessageRoute)

server.listen(8080, () => {  // Change app.listen to server.listen
    // // console.log('Server is running on port 8080');
});
