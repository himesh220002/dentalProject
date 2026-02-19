const express = require('express');
const router = express.Router();
const treatmentRecordController = require('../controllers/treatmentRecordController');

// Get all records for a patient
router.get('/patient/:patientId', treatmentRecordController.getTreatmentRecordsByPatient);

// Add a record
router.post('/', treatmentRecordController.createTreatmentRecord);

// Update a record
router.put('/:id', treatmentRecordController.updateTreatmentRecord);

// Delete a record
router.delete('/:id', treatmentRecordController.deleteTreatmentRecord);

module.exports = router;
