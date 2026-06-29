require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, process.env.ADMIN_URL].filter(Boolean),
    credentials: true,
  },
});

initSocket(io);
app.set('io', io);

server.listen(PORT, () => {
  console.log(`NannyConnect API running on port ${PORT}`);
});

module.exports = server;
