import express, { response, Router } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import './database';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import MessageController from './app/controllers/MessageController';

import authMiddleware from './app/middlewares/authMiddleware';
const app = express();
app.use(express.json());
app.use(cors());

const server = createServer(app);

// Serviço WS
const io = new Server(server, {
    cors: {
        origin: '*',
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST'],
    },
});

const routes = new Router();

const users = [];

io.on('connection', async (socket) => {
    console.log(`User ${socket.id} connected`);
    // Por ventura se o servidor parar e reiniciar vamos fazer uma chamada ao frontend verificando se estar na arena do usuário
    // e receber os dados deste usuário para lista-lo em users e por diante ser notificado aos demais usuários com broadcast.

    setTimeout(() => {
        socket.emit('user');
    }, 1000);

    socket.on('user', (data) => {
        const issaved = users.find((user) => user.id === data.id);

        if (issaved) {
            users.map((user, index) => {
                if (user.id === data.id) {
                    users[index].online = true;
                    users[index].socket_id = socket.id;
                }
            });
        } else {
            users.push({
                id: data.id,
                nick: data.nick,
                online: true,
                socket_id: socket.id,
            });
        }
        console.log('Conexão estabelecida para o usuario ' + socket.id);
        console.log(users);
        // Enviar para os demais a nova lista de usuário atualizada
        socket.broadcast.emit('users', users);
        // Envia para  o usuário atual a lista atualizada.
        setTimeout(() => {
            socket.emit('users', users);
        }, 1000);
    });

    // Rota para cadastrar um novo usuário na rede;
    routes.post('/create', UserController.store, (req, res) => {
        if (req.user) {
            const userObject = {
                id: req.user.id,
                nick: req.user.nick,
                online: false,
                socket_id: null,
            };
            socket.broadcast.emit('new-user', userObject);
            res.json(req.user);
        }
    });

    // Rota para criar a seção do usuário
    routes.post('/session', SessionController.store, (req, res) => {
        if (req.session) {
            const issaved = users.find(
                (user) => user.id === req.session.user.id
            );

            if (issaved) {
                users.map((user, index) => {
                    if (user.id === req.session.user.id) {
                        users[index].online = true;
                        users[index].socket_id = socket.id;
                    }
                });
            } else {
                users.push({
                    id: req.session.user.id,
                    nick: req.session.user.nick,
                    online: true,
                    socket_id: socket.id,
                });
            }
            console.log('Seção iniciada para o usuario ' + socket.id);
            console.log(users);

            socket.broadcast.emit('users', users);
            setTimeout(() => {
                socket.emit('users', users);
            }, 1000);

            return res.json(req.session);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User ${socket.id} disconected`);
        users.map((user, index) => {
            if (user.socket_id === socket.id) {
                users[index].online = false;
            }
        });
        setTimeout(() => {
            socket.broadcast.emit('users', users);
        }, 1000);

        console.log(users);
    });

    socket.on('reconnected', (data) => {
        // console.log(data);
        console.log(`User ${socket.id} reconectado`);
        users.map((user, index) => {
            if (user.id === data.id) {
                users[index].online = true;
                users[index].socket_id = socket.id;
            }
        });
        setTimeout(() => {
            socket.emit('users', users);
            socket.broadcast.emit('users', users);
        }, 1000);
        console.log(users);
    });

    socket.on('logout', (data) => {
        console.log(`Logout acionado pelo socket.id = ${data}`);
        users.map((user, index) => {
            if (user.socket_id === data) {
                users[index].online = false;
            }
        });
        setTimeout(() => {
            socket.broadcast.emit('users', users);
        }, 1000);
        console.log(users);
    });

    // A rota passara a utilizar o meddleware de autenticação via Bearer token
    routes.use(authMiddleware);

    routes.post('/message', MessageController.store, (req, res) => {
        if (req.msg) {
            socket.broadcast.emit('message', req.msg);
            return res.json(req.msg);
        }
    });

    socket.on('message', (data) => {
        socket.broadcast.emit('message', data);
        console.log('Mensagem enviada para: ');
        console.log(data);
    });

    routes.get('/messages', MessageController.index);

    routes.get('/users', UserController.index);
});

app.use(routes);

server.listen(3333);
