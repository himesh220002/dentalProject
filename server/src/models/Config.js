const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    key: {
        type: String,
        unique: true,
        required: true
    },
    value: {
        type: String,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Config', configSchema);
