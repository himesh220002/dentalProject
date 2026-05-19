const maskMongoUri = (uri) => {
    if (!uri) return 'None';
    return uri.replace(
        /^(mongodb\+srv:\/\/|mongodb:\/\/)([^:]+):([^@]+)@/,
        (match, protocol, username, password) => {
            return `${protocol}${username}:********@`;
        }
    );
};

require('dotenv').config({ override: true });
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/dental-clinic';

console.log('Attempting to connect to MongoDB at:', maskMongoUri(uri));

mongoose.connect(uri)
    .then(() => {
        console.log('✅ MongoDB Connected Successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    });
