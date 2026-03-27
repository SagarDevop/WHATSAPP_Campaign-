import api from './api';

export const leadService = {
    getLeads: async () => {
        const response = await api.get('/leads');
        return response.data;
    },
    addLead: async (leadData) => {
        const response = await api.post('/leads', leadData);
        return response.data;
    },
    updateLead: async (id, leadData) => {
        const response = await api.put(`/leads/${id}`, leadData);
        return response.data;
    },
    deleteLead: async (id) => {
        const response = await api.delete(`/leads/${id}`);
        return response.data;
    },
    uploadCSV: async (csvData) => {
        const response = await api.post('/leads/upload', { csvData });
        return response.data;
    },
};
