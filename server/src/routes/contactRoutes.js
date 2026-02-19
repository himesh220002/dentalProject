const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

router.post('/', contactController.submitContact);
router.get('/', contactController.getAllContacts);
router.put('/:id/read', contactController.markAsRead);
router.put('/:id/scheduled', contactController.markAsScheduled);

module.exports = router;
