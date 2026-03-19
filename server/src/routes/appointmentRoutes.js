const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.get('/', appointmentController.getAllAppointments);
router.get('/stats', appointmentController.getAppointmentStats);
router.get('/density', appointmentController.getAppointmentDensity);
router.get('/:id', appointmentController.getAppointmentById);
router.post('/', appointmentController.createAppointment);
router.put('/:id', appointmentController.updateAppointmentStatus);
router.post('/:id/resend', appointmentController.resendConfirmationEmail);
router.post('/public-check', appointmentController.publicCheckAppointment);
router.get('/patient/:patientId', appointmentController.getAppointmentsByPatientId);
router.post('/bulk-retrieve', appointmentController.getAppointmentsByIds);
router.put('/:id/viewed', appointmentController.markAsViewed);
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;
