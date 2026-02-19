const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', '-__-'],
        default: '-__-'
    },
    contact: {
        type: String,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    address: {
        type: String,
        default: '-__-'
    },
    alternateContact: {
        type: String,
        default: ''
    },
    addedByAdmin: {
        type: Boolean,
        default: false
    },
    medicalHistory: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Patient', patientSchema);
