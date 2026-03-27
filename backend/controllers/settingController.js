const Setting = require('../models/Setting');

// @desc    Get user settings
// @route   GET /api/settings
const getSettings = async (req, res) => {
    let settings = await Setting.findOne({ user: req.user.id });
    
    if (!settings) {
        settings = await Setting.create({ user: req.user.id });
    }
    
    res.status(200).json(settings);
};

// @desc    Update user settings
// @route   PUT /api/settings
const updateSettings = async (req, res) => {
    let settings = await Setting.findOne({ user: req.user.id });

    if (!settings) {
        settings = await Setting.create({ user: req.user.id });
    }

    const updatedSettings = await Setting.findByIdAndUpdate(
        settings._id, 
        req.body, 
        { new: true }
    );
    
    res.status(200).json(updatedSettings);
};

module.exports = {
    getSettings,
    updateSettings,
};
