import api from './api';

export const disputeService = {
  getDisputes: async (params = {}) => {
    const response = await api.get('/disputes', { params });
    return response.data;
  },
  createDispute: async (payload) => {
    const response = await api.post('/disputes', payload);
    return response.data;
  },
  updateDispute: async (id, payload) => {
    const response = await api.put(`/disputes/${id}`, payload);
    return response.data;
  }
};
