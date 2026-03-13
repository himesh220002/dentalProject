const request = require('supertest');
const { app } = require('../index');
const mongoose = require('mongoose');
const User = require('../models/User');
const Patient = require('../models/Patient');

describe('Auth & Patient Merging API', () => {
    it('should create a new user and a linked patient record on sync', async () => {
        const userData = {
            googleId: 'google-123',
            email: 'newuser@example.com',
            name: 'New User',
            image: 'http://example.com/image.png'
        };

        const res = await request(app)
            .post('/api/auth/sync')
            .send(userData);

        expect(res.status).toBe(200);
        expect(res.body.googleId).toBe('google-123');
        expect(res.body.patientId).toBeDefined();

        const patient = await Patient.findById(res.body.patientId);
        expect(patient.email).toBe('newuser@example.com');
        expect(patient.userId.toString()).toBe(res.body._id);
    });

    it('should merge an orphan patient into a new user during sync', async () => {
        // 1. Create an "orphan" patient (added by admin or quick schedule, no userId)
        const orphanPatient = new Patient({
            name: 'Orphan User',
            email: 'orphan@example.com',
            contact: '1212121212',
            age: 30, // Required
            addedByAdmin: true
        });
        await orphanPatient.save();

        // 2. Sync a new user with the SAME email
        const userData = {
            googleId: 'google-456',
            email: 'orphan@example.com',
            name: 'Orphan User'
        };

        const res = await request(app)
            .post('/api/auth/sync')
            .send(userData);

        expect(res.status).toBe(200);
        // The patientId in response should be the one we created
        expect(res.body.patientId).toBe(orphanPatient._id.toString());

        const updatedPatient = await Patient.findById(orphanPatient._id);
        expect(updatedPatient.userId.toString()).toBe(res.body._id);
    });

    it('should update user name and contact when profile is updated', async () => {
        // Create user
        const user = new User({ googleId: 'google-789', email: 'update@test.com', name: 'Old Name' });
        await user.save();

        const updateData = {
            userId: 'google-789',
            name: 'New Name',
            contact: '9876543210',
            age: 35 // Just in case
        };

        const res = await request(app)
            .put('/api/auth/update-profile') // Fixed to PUT
            .send(updateData);

        expect(res.status).toBe(200);
        expect(res.body.patient.name).toBe('New Name');
        expect(res.body.patient.contact).toBe('9876543210');

        const updatedUser = await User.findOne({ googleId: 'google-789' });
        expect(updatedUser.name).toBe('New Name');
        expect(updatedUser.contact).toBe('9876543210');
    });
});
