const mongoose = require('mongoose');

const leadSchema = mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        name: { type: String, required: true },
        phone: { type: String, required: true },
        category: { 
            type: String, 
            required: true, 
            enum: ['Dermatologist', 'Dentist', 'Psychologist', 'Orthopedic Clinic'] 
        },
        location: { type: String },
        status: { 
            type: String, 
            enum: ['pending', 'sent', 'failed', 'replied'], 
            default: 'pending' 
        },
        last_contacted_at: { type: Date },
        ai_message: { type: String },
    },
    { timestamps: true }
);

// Prevent duplicate phone numbers per user
leadSchema.index({ user: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model('Lead', leadSchema);
