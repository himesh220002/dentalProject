//src/controllers/handoverController.js
const Handover = require('../models/Handover');

// Save or Update handover data
const saveHandover = async (req, res) => {
    try {
        const { handoverformId, jsondata } = req.body;

        let handover = await Handover.findOne({ handoverformId });

        if (handover) {
            handover.jsondata = jsondata;
            await handover.save();
        } else {
            handover = new Handover({ handoverformId, jsondata });
            await handover.save();
        }

        res.status(200).json({ message: 'Handover saved successfully', handover });
    } catch (error) {
        res.status(500).json({ message: 'Error saving handover', error: error.message });
    }
};

// Get all handover versions (Handover IDs and snippets)
const getHandoverHistory = async (req, res) => {
    try {
        const history = await Handover.find().sort({ updatedAt: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching history', error: error.message });
    }
};

// Get specific handover data
const getHandoverById = async (req, res) => {
    try {
        const handover = await Handover.findOne({ handoverformId: req.params.id });
        if (!handover) return res.status(404).json({ message: 'Handover not found' });
        res.status(200).json(handover);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching handover', error: error.message });
    }
};

module.exports = {
    saveHandover,
    getHandoverHistory,
    getHandoverById
};
