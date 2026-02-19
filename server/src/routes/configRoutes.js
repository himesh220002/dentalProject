const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

router.post('/verify-password', configController.verifyAdminPassword);
router.get('/admin-password', configController.getAdminPassword); // Still useful for initial checks
router.put('/update-password', configController.updateAdminPassword);

module.exports = router;
