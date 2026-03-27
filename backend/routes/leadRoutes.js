const express = require('express');
const router = express.Router();
const {
    getLeads,
    addLead,
    updateLead,
    deleteLead,
    uploadLeads,
} = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getLeads).post(protect, addLead);
router.route('/:id').put(protect, updateLead).delete(protect, deleteLead);
router.post('/upload', protect, uploadLeads);

module.exports = router;
