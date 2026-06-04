const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    source: {
        type: String,
        enum: ['Website', 'Instagram', 'Facebook', 'Referral']
    },
    status: {
        type: String,
        enum: ['New', 'Contacted', 'Converted'],
        default: 'New'
    },
    notes: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Lead', LeadSchema);
