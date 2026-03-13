const request = require('supertest');
const { app } = require('../index');

describe('Patients API', () => {
    it('should create a new patient', async () => {
        const patientData = {
            name: 'John Doe',
            age: 30,
            contact: '1234567890',
            email: 'john@example.com'
        };

        const res = await request(app)
            .post('/api/patients')
            .send(patientData);

        expect(res.status).toBe(201);
        expect(res.body.name).toBe('John Doe');
        expect(res.body._id).toBeDefined();
    });

    it('should get all patients', async () => {
        const res = await request(app).get('/api/patients');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
