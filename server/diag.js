require('dotenv').config();
const mongoose = require('mongoose');

async function checkDb() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const handoverSchema = new mongoose.Schema({ handoverformId: String }, { collection: 'handover' });
        const Handover = mongoose.model('HandoverDiag', handoverSchema);

        const count = await Handover.countDocuments();
        const latest = await Handover.findOne().sort({ _id: -1 });

        console.log('Database Stats:');
        console.log('- Total Handover Docs:', count);
        console.log('- Latest Document ID:', latest ? latest.handoverformId : 'None');

        await mongoose.disconnect();
    } catch (err) {
        console.error('Diagnostic error:', err);
    }
}

checkDb();
