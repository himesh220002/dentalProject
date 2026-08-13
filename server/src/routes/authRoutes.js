const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/sync', authController.syncUser);
router.put('/update-profile', authController.updateProfile);
router.post('/link-patient', authController.linkByPatientId);
router.get('/google/:googleId', authController.getUserByGoogleId);

// New JWT based routes
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
