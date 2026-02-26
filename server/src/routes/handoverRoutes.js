const express = require('express');
const router = express.Router();
const { saveHandover, getHandoverHistory, getHandoverById, deleteHandover, activateHandover, getActiveHandover } = require('../controllers/handoverController');

// 1. Literal Routes (Must be first)
router.get('/history', getHandoverHistory);
router.get('/active', getActiveHandover);
router.get('/debug/all', async (req, res) => {
    try {
        const Handover = require('../models/Handover');
        const all = await Handover.find({});
        res.json(all);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/save', saveHandover);

// 2. Dynamic Routes with Prefix
router.post('/activate/:id', activateHandover);

// 3. Simple Dynamic Routes (Must be last)
router.get('/:id', getHandoverById);
router.delete('/:id', deleteHandover);

module.exports = router;
