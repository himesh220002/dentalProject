const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.get('/', appointmentController.getAllAppointments);
router.get('/stats', appointmentController.getAppointmentStats);
router.get('/:id', appointmentController.getAppointmentById);
router.post('/', appointmentController.createAppointment);
router.put('/:id', appointmentController.updateAppointmentStatus);
router.post('/:id/resend', appointmentController.resendConfirmationEmail);
router.get('/patient/:patientId', appointmentController.getAppointmentsByPatientId);
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;
