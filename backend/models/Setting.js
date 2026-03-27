const mongoose = require('mongoose');

const settingSchema = mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', unique: true },
        geminiApiKey: { type: String },
        chromeProfilePath: { type: String },
        dailyLimit: { type: Number, default: 60 },
        delayMin: { type: Number, default: 20 },
        delayMax: { type: Number, default: 60 },
        demoLinks: {
            dermatologist: { type: String, default: '/demo-derma' },
            dentist: { type: String, default: '/demo-dental' },
            psychologist: { type: String, default: '/demo-psycho' },
            orthopedic: { type: String, default: '/demo-ortho' },
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
