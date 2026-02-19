const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

router.get('/', patientController.getAllPatients);
router.post('/', patientController.createPatient);
router.get('/:id', patientController.getPatientById);
router.put('/:id', patientController.updatePatient);
router.delete('/:id', patientController.deletePatient);

module.exports = router;
