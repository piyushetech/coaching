const { Chat, Message } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { paginate, buildPaginationMeta } = require('../helpers');

const getMyChats = catchAsync(async (req, res) => {
  const chats = await Chat.find({ participants: req.user._id })
    .populate('participants', 'email role')
    .sort({ lastMessageAt: -1 });
  res.json({ status: 'success', data: chats });
});

const getChatMessages = catchAsync(async (req, res, next) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat || !chat.participants.includes(req.user._id)) {
    return next(new AppError('Chat not found.', 404));
  }

  const { skip, limit, page } = paginate(req.query.page, req.query.limit);
  const messages = await Message.find({ chat: chat._id, isDeleted: false })
    .populate('sender', 'email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Message.countDocuments({ chat: chat._id, isDeleted: false });
  res.json({
    status: 'success',
    data: messages.reverse(),
    pagination: buildPaginationMeta(total, page, limit),
  });
});

const deleteMessage = catchAsync(async (req, res, next) => {
  const message = await Message.findById(req.params.messageId);
  if (!message || message.sender.toString() !== req.user._id.toString()) {
    return next(new AppError('Message not found.', 404));
  }
  message.isDeleted = true;
  message.content = 'This message was deleted';
  await message.save();
  res.json({ status: 'success', message: 'Message deleted.' });
});

const blockUser = catchAsync(async (req, res, next) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) return next(new AppError('Chat not found.', 404));
  if (!chat.blockedBy.includes(req.user._id)) {
    chat.blockedBy.push(req.user._id);
    await chat.save();
  }
  res.json({ status: 'success', message: 'User blocked.' });
});

module.exports = { getMyChats, getChatMessages, deleteMessage, blockUser };
