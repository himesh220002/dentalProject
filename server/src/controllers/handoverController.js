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

// Delete a specific handover version
const deleteHandover = async (req, res) => {
    try {
        const handover = await Handover.findOneAndDelete({ handoverformId: req.params.id });
        if (!handover) return res.status(404).json({ message: 'Handover not found' });
        res.status(200).json({ message: 'Handover deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting handover', error: error.message });
    }
};

// Activate a specific handover version (Sync with Treatments and Configs)
const activateHandover = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Deactivate all others
        await Handover.updateMany({}, { isActive: false });

        // 2. Activate the selected one
        const activeHandover = await Handover.findOneAndUpdate(
            { handoverformId: id },
            { isActive: true },
            { new: true }
        );

        if (!activeHandover) return res.status(404).json({ message: `Handover version with ID '${id}' not found in database.` });

        const data = activeHandover.jsondata;

        // 3. Sync Treatments
        if (data.treatments && Array.isArray(data.treatments)) {
            // Replace treatments with the ones from handover
            await Treatment.deleteMany({});
            const treatmentsToInsert = data.treatments.map(t => ({
                name: t.name,
                price: t.price,
                description: t.description || 'Treatment details provided by clinic.',
                whyNeed: t.whyNeed || 'Essential dental care.',
                icon: t.icon || 'FaTooth'
            }));
            await Treatment.insertMany(treatmentsToInsert);
        }

        // 4. Sync Configs
        const configsToSync = [
            { key: 'clinic_phone', value: data.phone },
            { key: 'clinic_email', value: data.email },
            { key: 'clinic_name', value: data.clinicName },
            { key: 'clinic_address', value: `${data.address.street}, ${data.address.city}, ${data.address.state} - ${data.address.zip}` },
            { key: 'clinic_tagline', value: data.tagline }
        ];

        for (const config of configsToSync) {
            if (config.value) {
                await Config.findOneAndUpdate(
                    { key: config.key },
                    { value: config.value.toString() },
                    { upsert: true }
                );
            }
        }

        res.status(200).json({ message: 'Handover activated and synced successfully', activeHandover });
    } catch (error) {
        res.status(500).json({ message: 'Error activating handover', error: error.message });
    }
};

// Get the currently active handover
const getActiveHandover = async (req, res) => {
    try {
        const activeHandover = await Handover.findOne({ isActive: true });
        if (!activeHandover) return res.status(404).json({ message: 'No active handover found' });
        res.status(200).json(activeHandover);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching active handover', error: error.message });
    }
};

// Deactivate the currently active handover
const deactivateHandover = async (req, res) => {
    try {
        await Handover.updateMany({}, { isActive: false });
        res.status(200).json({ message: 'Handover deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deactivating handover', error: error.message });
    }
};

module.exports = {
    saveHandover,
    getHandoverHistory,
    getHandoverById,
    deleteHandover,
    activateHandover,
    getActiveHandover,
    deactivateHandover
};
