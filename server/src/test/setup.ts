import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach } from 'vitest';

let mongo: MongoMemoryServer;

beforeAll(async () => {
    let uri: string;
    console.log('🧪 Vitest Setup: Starting beforeAll...');
    console.log('NODE_ENV:', process.env.NODE_ENV);

    if (process.env.MONGO_URI_TEST) {
        uri = process.env.MONGO_URI_TEST;
        console.log(`📡 Connected to External Test MongoDB: ${uri}`);
    } else {
        console.log('🛠️ Spinning up In-Memory MongoDB...');
        try {
            mongo = await MongoMemoryServer.create();
            uri = mongo.getUri();
            console.log(`✅ In-Memory MongoDB Ready: ${uri}`);
        } catch (error) {
            console.error('❌ Failed to start MongoMemoryServer:', error);
            throw error;
        }
    }

    try {
        await mongoose.connect(uri);
        console.log('🔗 Mongoose connected successfully');
    } catch (error) {
        console.error('❌ Mongoose connection failed:', error);
        throw error;
    }
});

afterEach(async () => {
    // Clear collections between tests to ensure isolation
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    // Shut down the database and connection
    if (mongo) {
        await mongo.stop();
    }
    await mongoose.connection.close();
});
