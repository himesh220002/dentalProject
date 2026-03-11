const Patient = require('../models/Patient');

// Get all patients
exports.getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.aggregate([
            {
                $lookup: {
                    from: 'treatmentrecords',
                    localField: '_id',
                    foreignField: 'patientId',
                    as: 'treatmentRecords'
                }
            },
            {
                $lookup: {
                    from: 'appointments',
                    localField: '_id',
                    foreignField: 'patientId',
                    as: 'appointments'
                }
            },
            {
                $match: {
                    $or: [
                        { addedByAdmin: true },
                        { 'treatmentRecords.0': { $exists: true } },
                        { 'appointments.0': { $exists: true } }
                    ]
                }
            },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'treatmentrecords',
                    let: { pid: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$patientId', '$$pid'] } } },
                        { $sort: { date: -1 } },
                        { $limit: 1 }
                    ],
                    as: 'lastTreatment'
                }
            },
            {
                $lookup: {
                    from: 'appointments',
                    let: { pid: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$patientId', '$$pid'] },
                                        { $gte: ['$date', new Date().setHours(0, 0, 0, 0)] },
                                        { $ne: ['$status', 'Completed'] },
                                        { $ne: ['$isTicked', true] }
                                    ]
                                }
                            }
                        },
                        { $sort: { date: 1, time: 1 } },
                        { $limit: 1 }
                    ],
                    as: 'nextAppointment'
                }
            },
            {
                $addFields: {
                    lastTreatment: { $arrayElemAt: ['$lastTreatment', 0] },
                    nextAppointment: { $arrayElemAt: ['$nextAppointment', 0] }
                }
            },
            {
                $project: {
                    treatmentRecords: 0,
                    appointments: 0
                }
            }
        ]);
        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new patient
exports.createPatient = async (req, res) => {
    try {
        const newPatient = new Patient(req.body);
        const savedPatient = await newPatient.save();
        res.status(201).json(savedPatient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get a single patient
exports.getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        res.status(200).json(patient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a patient
exports.updatePatient = async (req, res) => {
    try {
        const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPatient) return res.status(404).json({ message: 'Patient not found' });
        res.status(200).json(updatedPatient);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a patient
exports.deletePatient = async (req, res) => {
    try {
        const deletedPatient = await Patient.findByIdAndDelete(req.params.id);
        if (!deletedPatient) return res.status(404).json({ message: 'Patient not found' });
        res.status(200).json({ message: 'Patient deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
