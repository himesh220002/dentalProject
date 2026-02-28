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

        const currentPassword = config ? config.value : 'admin123';



        if (password?.trim() === currentPassword.trim()) {
            res.status(200).json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Incorrect password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error verifying password', error: error.message });
    }
};

const { transporter } = require('../utils/mailer');
exports.checkMailer = async (req, res) => {
    try {
        console.log('--- LIVE MAILER CHECK TRIGGERED ---');
        console.log('Testing GMAIL_USER:', process.env.GMAIL_USER);

        // Test connection
        await transporter.verify();

        res.status(200).json({
            success: true,
            message: 'SMTP Connection Successful',
            user: process.env.GMAIL_USER,
            passConfigured: !!process.env.GMAIL_APP_PASS
        });
    } catch (error) {
        console.error('✖ LIVE MAILER CHECK FAILED:', error.message);
        res.status(500).json({
            success: false,
            message: 'SMTP Connection Failed',
            error: error.message,
            code: error.code,
            command: error.command
        });
    }
};
