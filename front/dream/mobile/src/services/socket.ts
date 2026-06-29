import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from './config';
import { tokenStorage } from './storage';
import { Message } from '../types';

let socket: Socket | null = null;

export const connectSocket = async (): Promise<Socket> => {
  if (socket?.connected) return socket;

  const token = await tokenStorage.getItem('accessToken');
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
  });

  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

export const getSocket = () => socket;

export const joinChat = (chatId: string) => {
  socket?.emit('join:chat', chatId);
};

export const leaveChat = (chatId: string) => {
  socket?.emit('leave:chat', chatId);
};

export const sendMessage = (data: {
  chatId: string;
  content: string;
  messageType?: string;
  mediaUrl?: string;
  fileName?: string;
}) => {
  socket?.emit('message:send', data);
};

export const startTyping = (chatId: string) => {
  socket?.emit('typing:start', { chatId });
};

export const stopTyping = (chatId: string) => {
  socket?.emit('typing:stop', { chatId });
};

export const markMessagesRead = (chatId: string, messageIds: string[]) => {
  socket?.emit('message:read', { chatId, messageIds });
};

export const onNewMessage = (callback: (message: Message) => void) => {
  socket?.on('message:new', callback);
  return () => socket?.off('message:new', callback);
};

export const onTypingStart = (callback: (data: { userId: string; chatId: string }) => void) => {
  socket?.on('typing:start', callback);
  return () => socket?.off('typing:start', callback);
};

export const onTypingStop = (callback: (data: { userId: string; chatId: string }) => void) => {
  socket?.on('typing:stop', callback);
  return () => socket?.off('typing:stop', callback);
};

export const onUserOnline = (callback: (data: { userId: string; isOnline: boolean }) => void) => {
  socket?.on('user:online', callback);
  return () => socket?.off('user:online', callback);
};
