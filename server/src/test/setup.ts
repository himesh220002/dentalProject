import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeAll, afterAll, afterEach } from 'vitest';

let mongo: MongoMemoryServer;

beforeAll(async () => {
    let uri: string;

    if (process.env.MONGO_URI_TEST) {
        uri = process.env.MONGO_URI_TEST;
        console.log(`Connected to External Test MongoDB: ${uri}`);
    } else {
        // Spin up the in-memory MongoDB instance
        mongo = await MongoMemoryServer.create();
        uri = mongo.getUri();
        console.log(`Connected to In-Memory MongoDB: ${uri}`);
    }

    await mongoose.connect(uri);
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
