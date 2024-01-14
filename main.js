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

// Web Socket

io.on('connection', (socket) => {
    console.log(socket.id);
    io.emit('message', { id: socket.id, message: 'connected' });
});