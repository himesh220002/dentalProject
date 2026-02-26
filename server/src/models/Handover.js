const mongoose = require('mongoose');

const handoverSchema = new mongoose.Schema({
    handoverformId: {
        type: String,
        required: true,
        unique: true
    },
    jsondata: {
        type: Object,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    }
}, { timestamps: true, collection: 'handover' });

module.exports = mongoose.model('Handover', handoverSchema);
