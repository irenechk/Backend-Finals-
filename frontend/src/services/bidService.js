import api from './api';

export const bidService = {
  createBid: async (payload) => {
    const response = await api.post('/bids', payload);
    return response.data;
  },
  getBids: async (params = {}) => {
    const response = await api.get('/bids', { params });
    return response.data;
  },
  getBidById: async (id) => {
    const response = await api.get(`/bids/${id}`);
    return response.data;
  },
  updateBid: async (id, payload) => {
    const response = await api.put(`/bids/${id}`, payload);
    return response.data;
  }
};
