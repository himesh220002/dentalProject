const mongoose = require('mongoose');

const handoverTempSchema = new mongoose.Schema({
    handoverformId: {
        type: String,
        required: true,
        unique: true
    },
    jsondata: {
        type: Object,
        required: true
    }
}, { timestamps: true, collection: 'handover' });

module.exports = mongoose.model('HandoverTemp', handoverTempSchema);
