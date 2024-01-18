const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

// ------ BDD ------

const sequelize = require('./bdd');

// Importer les modèles

const { User } = require('./model/user');
const { Conversation } = require('./model/conversation');
const { ConversationUser } = require('./model/conversationUser');
const { ConversationMessage } = require('./model/conversationMessage');

// Tester la connexion

try {
    sequelize.authenticate();
    console.log('Connexion à la base de données établie avec succès');
} catch (error) {
    console.error('Erreur de connexion à la base de données :', error);
}

// ------ Application ------

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(bodyParser.json());
app.use(express.static(join(__dirname, 'public')));
server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});

// Routes

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'public/index.html'));
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email, password } });
        if (user !== null) {
            res.send(user);
        } else {
            res.send({'message': 'error : user not found'});
        }
    } catch (err) {
        res.send('error :' + err);
    }
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (user !== null) {
            res.send({'message': 'error : user already exist'});
        } else {
            res.send(await User.create({ username, email, password }));
        }
    } catch (err) {
        res.send('error :' + err);
    }
});

app.get('/userlist', async (req, res) => {
    try {
        const users = await User.findAll();
        res.send(users);
    } catch (err) {
        res.send('error :' + err);
    }
});

app.get('/conversations/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let conversationsUser = await ConversationUser.findAll({ where: { idUser: id } });
        let conversations = [];
        for (const conversationUser of conversationsUser) {
            let conversation = await Conversation.findOne({ where: { id: conversationUser.idConversation } });
            let userList = await ConversationUser.findAll({ where: { idConversation: conversationUser.idConversation } });
            let users = [];
            for (const user of userList) {
                users.push(await User.findOne({ where: { id: user.idUser } }));
            }
            conversation.dataValues.users = users;
            conversations.push(conversation);
        }
        res.send(conversations);
    } catch (err) {
        res.send('error :' + err);
    }
});

app.get('/conversation/messages/:id', async (req, res) => {
    const { id } = req.params;
    try {
        let messages = await ConversationMessage.findAll({ where: { idConversation: id } });
        res.send(messages);
    } catch (err) {
        res.send('error :' + err);
    }
});

app.post('/conversation', async (req, res) => {
    const { currentUser, users } = req.body;
    try {
        let title = users[0].username + ' & ' + currentUser.username;
        if (users.length >= 2) {
            title = 'Groupe ' + currentUser.username + ', ';
            for (const user of users) {
                title += user.username + ', ';
            }
            title = title.slice(0, -2);
        } else {
            let conversationsUser = await ConversationUser.findAll({ where: { idUser: users[0].id } });
            for (const conversationUser of conversationsUser) {
                let userList = await ConversationUser.findAll({ where: { idConversation: conversationUser.idConversation } });
                if (userList.length === 2) {
                    for (const user of userList) {
                        if (user.idUser == currentUser.id) {
                            res.send({ id: conversationUser.idConversation, title: users[0].username, users: [users[0], currentUser] });
                            return;
                        }
                    }
                }
            }
        }
        let conversation = await Conversation.create({ title: title });
        users.push(currentUser);
        for (const user of users) {
            await ConversationUser.create({ idConversation: conversation.id, idUser: user.id });
        }
        conversation.dataValues.users = users;
        for (const user of users) {
            if (currentConnections.find(u => u.id == user.id) && user.id != currentUser.id) {
                io.to(currentConnections.find(u => u.id == user.id).socketId).emit('addConversation', conversation);
            }
        }
        res.send(conversation);
    } catch (err) {
        res.send('error :' + err);
    }
});

// Web Socket

let currentConnections = [];

io.on('connection', (socket) => {
    console.log(socket.id);
    io.emit('message', { id: socket.id, message: 'connected' });

    socket.on('connected', (user, callback) => {
        user.socketId = socket.id;
        currentConnections.push(user);
        io.emit('newConnected', { user: user });
        callback({ socketId: socket.id, currentConnections: currentConnections });
    });

    socket.on('disconnecting', () => {
        console.log('user disconnected : ' + socket.id);
        let user = currentConnections.find(u => u.socketId == socket.id);
        currentConnections = currentConnections.filter(u => u.socketId != socket.id);
        io.emit('disconnected', { user: user });
    });

    socket.on('sendMessage', async (conversation, idUser, message) => {
        let newMessage = await ConversationMessage.create({ idConversation: conversation.id, idUser: idUser, message: message });
        for (const user of conversation.users) {
            if (currentConnections.find(u => u.id == user.id)) {
                io.to(currentConnections.find(u => u.id == user.id).socketId).emit('addMessage', newMessage);
            }
        }
    });
});