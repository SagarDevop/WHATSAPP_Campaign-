const Campaign = require('../models/Campaign');
const Lead = require('../models/Lead');
const Log = require('../models/Log');
const Setting = require('../models/Setting');
const { generateMessage } = require('../services/geminiService');
const WhatsAppEngine = require('../automation/whatsappEngine');

let activeEngines = {}; // Map user ID to engine instance

// @desc    Start Campaign
// @route   POST /api/campaigns/start
const startCampaign = async (req, res) => {
    const { campaignId } = req.body;
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
    }

    if (campaign.status === 'running') {
        return res.status(400).json({ message: 'Campaign already running' });
    }

    // Check if any OTHER campaign is running for this user
    const runningCampaign = await Campaign.findOne({ user: req.user.id, status: 'running' });
    if (runningCampaign) {
        return res.status(400).json({ message: `Another campaign "${runningCampaign.name}" is currently running. Please stop it before starting a new one.` });
    }

    const settings = await Setting.findOne({ user: req.user.id });
    if (!settings || !settings.chromeProfilePath) {
        return res.status(400).json({ message: 'Chrome Profile Path not set in settings' });
    }

    // Update campaign status
    campaign.status = 'running';
    campaign.startedAt = new Date();
    await campaign.save();

    // Start processing in "background" (asynchronous)
    processCampaign(req.user.id, campaign, settings);

    res.status(200).json({ message: 'Campaign started', campaign });
};

// Internal processing function
const processCampaign = async (userId, campaign, settings) => {
    try {
        // Initialize Engine
        if (!activeEngines[userId]) {
            activeEngines[userId] = new WhatsAppEngine(settings.chromeProfilePath);
            await activeEngines[userId].init();
        }

        const engine = activeEngines[userId];
        
        // Fetch leads to process (process both pending and previously failed leads)
        const filter = { user: userId, status: { $in: ['pending', 'failed'] } };
        if (campaign.categoryFilter !== 'All') {
            filter.category = campaign.categoryFilter;
        }

        const leads = await Lead.find(filter);
        campaign.totalLeads = leads.length;
        await campaign.save();

        for (const lead of leads) {
            // Re-check campaign status (if user stopped it)
            const currentCampaign = await Campaign.findById(campaign._id);
            if (!currentCampaign || currentCampaign.status !== 'running') break;

            await Log.create({ user: userId, campaign: campaign._id, message: `Generating message for ${lead.name}...`, lead: lead._id });
            
            // Generate AI Message
            const aiMsg = await generateMessage(userId, lead);
            if (!aiMsg) {
                await Log.create({ user: userId, campaign: campaign._id, type: 'error', message: `Failed to generate message for ${lead.name}`, lead: lead._id });
                lead.status = 'failed';
                await lead.save();
                campaign.failedCount++;
                campaign.processedLeads++;
                await campaign.save();
                continue;
            }

            lead.ai_message = aiMsg;
            await lead.save();

            // Send via WhatsApp
            await Log.create({ user: userId, campaign: campaign._id, message: `Sending message to ${lead.phone} via WhatsApp...`, lead: lead._id });
            const result = await engine.sendMessage(lead.phone, aiMsg);

            if (result.success) {
                lead.status = 'sent';
                lead.last_contacted_at = new Date();
                campaign.successCount++;
                await Log.create({ user: userId, campaign: campaign._id, type: 'success', message: `Message sent to ${lead.name} successfully`, lead: lead._id });
            } else {
                lead.status = 'failed';
                campaign.failedCount++;
                await Log.create({ user: userId, campaign: campaign._id, type: 'error', message: `Failed to send message to ${lead.name}`, lead: lead._id });
            }

            campaign.processedLeads++;
            await lead.save();
            await campaign.save();

            // Safety Delay
            const delay = Math.floor(Math.random() * (settings.delayMax - settings.delayMin + 1)) + settings.delayMin;
            await new Promise(r => setTimeout(r, delay * 1000));
        }

        campaign.status = 'completed';
        campaign.completedAt = new Date();
        await campaign.save();
        await Log.create({ user: userId, campaign: campaign._id, type: 'info', message: `Campaign completed successfully.` });

    } catch (error) {
        console.error('Campaign Error:', error);
        campaign.status = 'idle';
        await campaign.save();
        await Log.create({ user: userId, campaign: campaign._id, type: 'error', message: `System error: ${error.message}` });
    }
};

// @desc    Stop Campaign
// @route   POST /api/campaigns/stop
const stopCampaign = async (req, res) => {
    const { campaignId } = req.body;
    const campaign = await Campaign.findById(campaignId);

    if (campaign) {
        campaign.status = 'idle';
        await campaign.save();
        
        // Optional: Close engine if needed, or keep it warm
        // if (activeEngines[req.user.id]) {
        //     await activeEngines[req.user.id].quit();
        //     delete activeEngines[req.user.id];
        // }
    }

    res.status(200).json({ message: 'Campaign stopped', campaign });
};

// @desc    Get Campaigns
// @route   GET /api/campaigns
const getCampaigns = async (req, res) => {
    try {
        console.log(`Fetching campaigns for user: ${req.user.id}`);
        const campaigns = await Campaign.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(campaigns);
    } catch (error) {
        console.error('Error in getCampaigns:', error.message);
        res.status(500).json({ message: 'Error fetching campaigns' });
    }
};

// @desc    Get Single Campaign
// @route   GET /api/campaigns/:id
const getCampaign = async (req, res) => {
    try {
        console.log(`Fetching campaign ${req.params.id} for user: ${req.user.id}`);
        const campaign = await Campaign.findOne({ _id: req.params.id, user: req.user.id });
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        res.status(200).json(campaign);
    } catch (error) {
        console.error('Error in getCampaign:', error.message);
        res.status(500).json({ message: 'Error fetching campaign' });
    }
};

// @desc    Create Campaign
// @route   POST /api/campaigns
const createCampaign = async (req, res) => {
    const { name, categoryFilter } = req.body;
    const campaign = await Campaign.create({
        user: req.user.id,
        name,
        categoryFilter
    });
    res.status(201).json(campaign);
};

// @desc    Delete Campaign
// @route   DELETE /api/campaigns/:id
const deleteCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findOne({ _id: req.params.id, user: req.user.id });
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        
        // Don't delete if running
        if (campaign.status === 'running') {
            return res.status(400).json({ message: 'Cannot delete a running campaign. Please stop it first.' });
        }

        await Campaign.deleteOne({ _id: req.params.id });
        // Also delete associated logs
        await Log.deleteMany({ campaign: req.params.id });
        
        res.status(200).json({ message: 'Campaign deleted successfully' });
    } catch (error) {
        console.error('Error in deleteCampaign:', error.message);
        res.status(500).json({ message: 'Error deleting campaign' });
    }
};

// @desc    Get Logs
// @route   GET /api/campaigns/logs/:campaignId
const getLogs = async (req, res) => {
    const logs = await Log.find({ campaign: req.params.campaignId }).sort({ createdAt: -1 }).limit(50);
    res.status(200).json(logs);
};

module.exports = {
    startCampaign,
    stopCampaign,
    getCampaigns,
    getCampaign,
    createCampaign,
    getLogs,
    deleteCampaign
};
