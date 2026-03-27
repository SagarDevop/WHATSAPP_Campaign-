const mongoose = require('mongoose');

const campaignSchema = mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        name: { type: String, required: true },
        status: { type: String, enum: ['idle', 'running', 'paused', 'completed'], default: 'idle' },
        categoryFilter: { 
            type: String, 
            enum: ['All', 'Dermatologist', 'Dentist', 'Psychologist', 'Orthopedic Clinic'], 
            default: 'All' 
        },
        totalLeads: { type: Number, default: 0 },
        processedLeads: { type: Number, default: 0 },
        successCount: { type: Number, default: 0 },
        failedCount: { type: Number, default: 0 },
        startedAt: { type: Date },
        completedAt: { type: Date },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Campaign', campaignSchema);
