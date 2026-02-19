const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    isTicked: {
        type: Boolean,
        default: false
    },
    amount: {
        type: Number,
        default: 0
    },
    paymentStatus: {
        type: String,
        enum: ['None', 'Pending', 'Paid'],
        default: 'None'
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled'],
        default: 'Scheduled'
    },
    markedPaidAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
