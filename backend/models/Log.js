const mongoose = require('mongoose');

const logSchema = mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
        type: { type: String, enum: ['info', 'success', 'error', 'warning'], default: 'info' },
        message: { type: String, required: true },
        lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Log', logSchema);
