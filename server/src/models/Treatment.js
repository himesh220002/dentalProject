const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    whyNeed: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true, // Stores the icon name like 'FaTooth'
        default: 'FaTooth'
    }
}, { timestamps: true });

module.exports = mongoose.model('Treatment', treatmentSchema);
