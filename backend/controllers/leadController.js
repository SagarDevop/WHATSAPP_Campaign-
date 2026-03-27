const fs = require('fs');
const csv = require('csv-parser');
const Lead = require('../models/Lead');

// @desc    Get all leads
// @route   GET /api/leads
const getLeads = async (req, res) => {
    const leads = await Lead.find({ user: req.user.id });
    res.status(200).json(leads);
};

// @desc    Add single lead
// @route   POST /api/leads
const addLead = async (req, res) => {
    const { name, phone, category, location } = req.body;

    if (!name || !phone || !category) {
        return res.status(400).json({ message: 'Please add all required fields' });
    }

    try {
        const lead = await Lead.create({
            user: req.user.id,
            name,
            phone,
            category,
            location,
        });
        res.status(201).json(lead);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Lead with this phone number already exists' });
        }
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
const updateLead = async (req, res) => {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
    }

    // Check for user
    if (lead.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedLead);
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
const deleteLead = async (req, res) => {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
    }

    // Check for user
    if (lead.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'User not authorized' });
    }

    await lead.deleteOne();
    res.status(200).json({ id: req.params.id });
};

// @desc    Bulk Upload CSV
// @route   POST /api/leads/upload
const uploadLeads = async (req, res) => {
    // In a real production app, we'd use multer to handle the file upload
    // For this implementation, we'll assume the client sends the file path or raw csv content
    // Actually, I'll implement a simple handler for CSV strings or paths
    const { csvData } = req.body; // Expecting raw CSV string for simplicity in this demo

    if (!csvData) {
        return res.status(400).json({ message: 'No CSV data provided' });
    }

    const results = [];
    const stream = require('stream');
    const bufferStream = new stream.PassThrough();
    bufferStream.end(csvData);

    let createdCount = 0;
    let duplicateCount = 0;

    bufferStream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            for (const item of results) {
                try {
                    await Lead.create({
                        user: req.user.id,
                        name: item.name,
                        phone: item.phone,
                        category: item.category,
                        location: item.location,
                    });
                    createdCount++;
                } catch (error) {
                    if (error.code === 11000) duplicateCount++;
                }
            }
            res.status(200).json({
                message: 'Upload processed',
                total: results.length,
                created: createdCount,
                duplicates: duplicateCount,
            });
        });
};

module.exports = {
    getLeads,
    addLead,
    updateLead,
    deleteLead,
    uploadLeads,
};
