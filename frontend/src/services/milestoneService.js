import api from './api';

export const milestoneService = {
  createMilestone: async (payload) => {
    const response = await api.post('/milestones', payload);
    return response.data;
  },
  getMilestones: async (params = {}) => {
    const response = await api.get('/milestones', { params });
    return response.data;
  },
  updateMilestone: async (id, payload) => {
    const response = await api.put(`/milestones/${id}`, payload);
    return response.data;
  }
};
