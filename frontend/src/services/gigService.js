import api from './api';

export const gigService = {
  getGigs: async (params = {}) => {
    const response = await api.get('/gigs', { params });
    return response.data;
  },
  getGigById: async (id) => {
    const response = await api.get(`/gigs/${id}`);
    return response.data;
  },
  createGig: async (payload) => {
    const response = await api.post('/gigs', payload);
    return response.data;
  },
  updateGig: async (id, payload) => {
    const response = await api.put(`/gigs/${id}`, payload);
    return response.data;
  },
  deleteGig: async (id) => {
    const response = await api.delete(`/gigs/${id}`);
    return response.data;
  }
};
