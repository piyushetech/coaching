const { Message, Chat, Nanny } = require('../models');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { sendPushNotification } = require('../services/notificationService');

const onlineUsers = new Map();

const initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    onlineUsers.set(socket.user._id.toString(), socket.id);

    if (socket.user.role === 'nanny') {
      Nanny.findOneAndUpdate({ user: socket.user._id }, { isOnline: true, lastSeen: new Date() });
    }

    io.emit('user:online', { userId: socket.user._id, isOnline: true });

    socket.on('join:chat', (chatId) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on('leave:chat', (chatId) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on('typing:start', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('typing:start', { userId: socket.user._id, chatId });
    });

    socket.on('typing:stop', ({ chatId }) => {
      socket.to(`chat:${chatId}`).emit('typing:stop', { userId: socket.user._id, chatId });
    });

    socket.on('message:send', async ({ chatId, content, messageType = 'text', mediaUrl, fileName }) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.participants.includes(socket.user._id)) return;

        const blocked = chat.blockedBy.some((id) => id.toString() === socket.user._id.toString());
        if (blocked) return;

        const message = await Message.create({
          chat: chatId,
          sender: socket.user._id,
          content,
          messageType,
          mediaUrl,
          fileName,
        });

        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: content || `[${messageType}]`,
          lastMessageAt: new Date(),
        });

        const populated = await Message.findById(message._id).populate('sender', 'email role');

        io.to(`chat:${chatId}`).emit('message:new', populated);

        const recipientId = chat.participants.find(
          (p) => p.toString() !== socket.user._id.toString()
        );
        const recipient = await User.findById(recipientId);
        if (recipient) {
          await sendPushNotification(recipient, 'New Message', content || 'Sent an attachment', {
            type: 'message',
            chatId,
          });
        }
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('message:read', async ({ chatId, messageIds }) => {
      await Message.updateMany(
        { _id: { $in: messageIds }, chat: chatId },
        { $addToSet: { readBy: socket.user._id } }
      );
      socket.to(`chat:${chatId}`).emit('message:read', { userId: socket.user._id, messageIds });
    });

    socket.on('disconnect', async () => {
      onlineUsers.delete(socket.user._id.toString());

      if (socket.user.role === 'nanny') {
        await Nanny.findOneAndUpdate(
          { user: socket.user._id },
          { isOnline: false, lastSeen: new Date() }
        );
      }

      io.emit('user:online', { userId: socket.user._id, isOnline: false });
    });
  });
};

module.exports = { initSocket, onlineUsers };
