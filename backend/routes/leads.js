const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');

// GET /api/leads - get all leads
router.get('/', async (req, res) => {
    try {
        const leads = await Lead.find().sort({ createdAt: -1 });
        res.json(leads);
    } catch (err) {
        res.status(500).json({ error: 'Server Error', message: err.message });
    }
});

// POST /api/leads - add new lead
router.post('/', async (req, res) => {
    try {
        const newLead = new Lead(req.body);
        const lead = await newLead.save();
        res.status(201).json(lead);
    } catch (err) {
        res.status(400).json({ error: 'Bad Request', message: err.message });
    }
});

// PUT /api/leads/:id - update lead
router.put('/:id', async (req, res) => {
    try {
        const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { 
            new: true, 
            runValidators: true 
        });
        if (!lead) return res.status(404).json({ error: 'Lead not found' });
        res.json(lead);
    } catch (err) {
        res.status(400).json({ error: 'Bad Request', message: err.message });
    }
});

// DELETE /api/leads/:id - delete lead
router.delete('/:id', async (req, res) => {
    try {
        const lead = await Lead.findByIdAndDelete(req.params.id);
        if (!lead) return res.status(404).json({ error: 'Lead not found' });
        res.json({ message: 'Lead removed successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server Error', message: err.message });
    }
});

module.exports = router;
