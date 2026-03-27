const Lead = require('../models/Lead');
const Log = require('../models/Log');
const Campaign = require('../models/Campaign');

// @desc    Get Dashboard Statistics
// @route   GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Basic Counts
        const totalLeads = await Lead.countDocuments({ user: userId });
        const sent = await Lead.countDocuments({ user: userId, status: 'sent' });
        const pending = await Lead.countDocuments({ user: userId, status: 'pending' });
        const failed = await Lead.countDocuments({ user: userId, status: 'failed' });

        // 2. Outreach Performance (Last 7 Days)
        const performanceData = [];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);

            const count = await Lead.countDocuments({
                user: userId,
                status: 'sent',
                updatedAt: { $gte: date, $lt: nextDate }
            });

            performanceData.push({
                name: days[date.getDay()],
                sent: count
            });
        }

        // 3. Recent Activities (Last 5 Logs)
        const recentActivities = await Log.find({ 
            user: userId,
            type: { $in: ['success', 'error'] }
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('lead', 'name');

        res.status(200).json({
            summary: {
                totalLeads,
                sent,
                pending,
                failed
            },
            performanceData,
            recentActivities: recentActivities.map(log => ({
                id: log._id,
                message: log.message,
                type: log.type,
                leadName: log.lead ? log.lead.name : 'Unknown',
                time: log.createdAt
            }))
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getDashboardStats
};
