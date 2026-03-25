require('dotenv').config();
const mongoose = require('mongoose');
const Config = require('./src/models/Config');

async function resetAdminPassword() {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            console.error('Error: MONGO_URI not found in .env file.');
            process.exit(1);
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('Connected.');

        const newPassword = 'admin123'; // You can change this here if you want a different password

        const config = await Config.findOneAndUpdate(
            { key: 'admin_password' },
            { value: newPassword, updatedAt: Date.now() },
            { new: true, upsert: true }
        );

        console.log('------------------------------------------');
        console.log(`SUCCESS: Admin password has been set to: ${config.value}`);
        console.log('------------------------------------------');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

resetAdminPassword();
