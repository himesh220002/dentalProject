const express = require('express');
const router = express.Router();
const { saveHandover, getHandoverHistory, getHandoverById, deleteHandover } = require('../controllers/handoverController');

router.post('/save', saveHandover);
router.get('/history', getHandoverHistory);
router.get('/:id', getHandoverById);
router.delete('/:id', deleteHandover);

module.exports = router;
