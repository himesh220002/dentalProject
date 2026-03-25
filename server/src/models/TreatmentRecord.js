const mongoose = require('mongoose');

const treatmentRecordSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    treatmentName: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    cost: {
        type: Number,
        required: true
    },
    notes: {
        type: String
    },
    prescription: {
        type: String
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('TreatmentRecord', treatmentRecordSchema);
