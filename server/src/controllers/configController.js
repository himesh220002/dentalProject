const Config = require('../models/Config');

exports.getAdminPassword = async (req, res) => {
    try {
        let config = await Config.findOne({ key: 'admin_password' });
        if (!config) {
            // Seed default password if not exists
            config = await Config.create({ key: 'admin_password', value: 'admin123' });
        }
        res.status(200).json({ password: config.value });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving password', error: error.message });
    }
};

exports.updateAdminPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword) {
            return res.status(400).json({ message: 'New password is required' });
        }

        const config = await Config.findOneAndUpdate(
            { key: 'admin_password' },
            { value: newPassword, updatedAt: Date.now() },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating password', error: error.message });
    }
};

exports.verifyAdminPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const config = await Config.findOne({ key: 'admin_password' });

        // Handle case where config doesn't exist yet but we are trying to verify
        const currentPassword = config ? config.value : 'admin123';

        if (password === currentPassword) {
            res.status(200).json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Incorrect password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error verifying password', error: error.message });
    }
};
