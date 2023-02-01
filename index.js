const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 4000;

const io = require('socket.io')(PORT, {
	cors: {
		origin: process.env.CLIENT_URL,
	},
});

let users = [];

const addUser = (userId, socketId) => {
	!users.some((user) => user.userId === userId) &&
		users.push({userId, socketId});
};

const removeUser = (socketId) => {
	users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
	return users.find((user) => user.userId === userId);
};

io.on('connection', (socket) => {
	socket.on('addUser', (userId) => {
		addUser(userId, socket.id);
		io.emit('getUsers', users);
	});

	socket.on(
		'sendLetter',
		({sender, receiver, text, subject, conversationId}) => {
			const user = getUser(receiver);
			if (user) {
				io.to(user.socketId).emit('getLetter', {
					sender,
					receiver,
					text,
					subject,
					conversationId,
				});
			}
		}
	);

	socket.on('disconnect', () => {
		removeUser(socket.id);
		io.emit('getUsers', users);
	});
});
