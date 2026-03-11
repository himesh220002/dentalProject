const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/sync', authController.syncUser);
router.put('/update-profile', authController.updateProfile);
router.get('/google/:googleId', authController.getUserByGoogleId);

module.exports = router;
