import api from './api';

export const portfolioService = {
  getAllFreelancers: async (params = {}) => {
    const response = await api.get('/portfolio', { params });
    return response.data;
  },
  getFreelancerPortfolio: async (freelancerId) => {
    const response = await api.get(`/portfolio/${freelancerId}`);
    return response.data;
  },
  updatePortfolio: async (payload) => {
    const response = await api.put('/portfolio', payload);
    return response.data;
  }
};
