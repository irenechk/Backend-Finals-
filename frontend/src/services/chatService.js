import api from './api';

export const chatService = {
  getChats: async () => {
    const response = await api.get('/chats');
    return response.data;
  },
  getChatById: async (id) => {
    const response = await api.get(`/chats/${id}`);
    return response.data;
  },
  createOrGetChat: async (payload) => {
    const response = await api.post('/chats', payload);
    return response.data;
  },
  sendMessage: async (chatId, payload) => {
    const response = await api.post(`/chats/${chatId}/messages`, payload);
    return response.data;
  }
};
