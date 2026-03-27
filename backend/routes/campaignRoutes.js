const express = require('express');
const router = express.Router();
const {
    startCampaign,
    stopCampaign,
    getCampaigns,
    getCampaign,
    createCampaign,
    getLogs,
    deleteCampaign
} = require('../controllers/campaignController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getCampaigns).post(protect, createCampaign);
router.route('/:id').get(protect, getCampaign).delete(protect, deleteCampaign);
router.post('/start', protect, startCampaign);
router.post('/stop', protect, stopCampaign);
router.get('/logs/:campaignId', protect, getLogs);

module.exports = router;
