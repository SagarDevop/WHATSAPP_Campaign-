import api from './api';

export const campaignService = {
    getCampaigns: async () => {
        const response = await api.get('/campaigns');
        return response.data;
    },
    getCampaign: async (id) => {
        const response = await api.get(`/campaigns/${id}`);
        return response.data;
    },
    createCampaign: async (data) => {
        const response = await api.post('/campaigns', data);
        return response.data;
    },
    startCampaign: async (campaignId) => {
        const response = await api.post('/campaigns/start', { campaignId });
        return response.data;
    },
    stopCampaign: async (campaignId) => {
        const response = await api.post('/campaigns/stop', { campaignId });
        return response.data;
    },
    getLogs: async (campaignId) => {
        const response = await api.get(`/campaigns/logs/${campaignId}`);
        return response.data;
    },
    deleteCampaign: async (id) => {
        const response = await api.delete(`/campaigns/${id}`);
        return response.data;
    },
};
