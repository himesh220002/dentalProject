const mongoose = require('mongoose');
require('dotenv').config({ path: '/home/himesh/MYProjects/Nextjs/dentalProject/server/.env' });

const Handover = require('/home/himesh/MYProjects/Nextjs/dentalProject/server/src/models/Handover');

async function updateDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const activeHandover = await Handover.findOne({ isActive: true });
        if (activeHandover) {
            let updated = false;

            // Just replace all occurrences of "Dr. Tooth Dental" and "ToothOp" in the JSON string
            let jsonString = JSON.stringify(activeHandover.jsondata);
            if (jsonString.includes('Dr. Tooth Dental') || jsonString.includes('ToothOp')) {
                jsonString = jsonString.replace(/Dr\. Tooth Dental/g, 'ToothOp');
                jsonString = jsonString.replace(/drToothdental\.in/g, 'toothop.com');
                activeHandover.jsondata = JSON.parse(jsonString);
                activeHandover.markModified('jsondata');
                await activeHandover.save();
                console.log('Database updated successfully!');
            } else {
                console.log('No matching names found in active handover.', activeHandover.jsondata.clinicName);
            }
        } else {
            console.log('No active handover found.');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
updateDB();
