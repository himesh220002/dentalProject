const express = require('express');
const router = express.Router();
const { saveHandover, getHandoverHistory, getHandoverById } = require('../controllers/handoverController');

router.post('/save', saveHandover);
router.get('/history', getHandoverHistory);
router.get('/:id', getHandoverById);

module.exports = router;
