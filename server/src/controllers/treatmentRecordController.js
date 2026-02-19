const TreatmentRecord = require('../models/TreatmentRecord');

// Get all treatment records for a specific patient
exports.getTreatmentRecordsByPatient = async (req, res) => {
    try {
        const records = await TreatmentRecord.find({ patientId: req.params.patientId }).sort({ date: -1 });
        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a new treatment record
exports.createTreatmentRecord = async (req, res) => {
    try {
        const newRecord = new TreatmentRecord(req.body);
        const savedRecord = await newRecord.save();
        res.status(201).json(savedRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a treatment record
exports.deleteTreatmentRecord = async (req, res) => {
    try {
        const deletedRecord = await TreatmentRecord.findByIdAndDelete(req.params.id);
        if (!deletedRecord) return res.status(404).json({ message: 'Record not found' });
        res.status(200).json({ message: 'Record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Update a treatment record
exports.updateTreatmentRecord = async (req, res) => {
    try {
        const updatedRecord = await TreatmentRecord.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedRecord) return res.status(404).json({ message: 'Record not found' });
        res.status(200).json(updatedRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
