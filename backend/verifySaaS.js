const axios = require('axios');
require('dotenv').config();

const API_URL = `http://localhost:${process.env.PORT || 5000}/api`;

async function verifySaaS() {
    try {
        console.log('--- SaaS Platform Verification ---');
        
        // 1. Login
        console.log('Logging in as admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@devphics.com',
            password: 'admin123'
        });
        
        const token = loginRes.data.token;
        console.log('Login successful! Token acquired.');
        
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // 2. Get Settings (to check profile path)
        const settingsRes = await axios.get(`${API_URL}/settings`, config);
        console.log('User Settings:', settingsRes.data);

        // 3. Get Campaigns
        const campaignsRes = await axios.get(`${API_URL}/campaigns`, config);
        const campaigns = campaignsRes.data;
        
        if (campaigns.length === 0) {
            console.log('No campaigns found. Creating a test campaign...');
            const newCampaignRes = await axios.post(`${API_URL}/campaigns`, {
                name: 'Test Campaign',
                categoryFilter: 'All'
            }, config);
            campaigns.push(newCampaignRes.data);
        }

        const campaignId = campaigns[0]._id;
        console.log(`Using Campaign: ${campaigns[0].name} (ID: ${campaignId})`);

        // 4. Start Campaign
        console.log('Starting campaign via API...');
        const startRes = await axios.post(`${API_URL}/campaigns/start`, { campaignId }, config);
        console.log('API Response:', startRes.data.message);
        
        console.log('--- VERIFICATION TRIGGERED ---');
        console.log('The backend should now open Chrome on your machine.');
        console.log('Wait a few seconds for WhatsApp Web to load...');

    } catch (error) {
        console.error('Error during verification:', error.response ? error.response.data : error.message);
    }
}

verifySaaS();
