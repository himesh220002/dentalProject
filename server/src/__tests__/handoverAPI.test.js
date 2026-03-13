const request = require('supertest');
const { app } = require('../index');
const Handover = require('../models/Handover');

describe('Handover & System State API', () => {
    const sampleHandover = {
        handoverformId: 'test-v1',
        jsondata: {
            clinicName: 'Test Clinic',
            doctorName: 'Dr. Test',
            email: 'test@clinic.com',
            phone: '1234567890',
            tagline: 'Best Care',
            address: { street: 'Main', city: 'City', state: 'ST', zip: '12345' },
            treatments: [
                { name: 'Root Canal', price: '3500' }
            ]
        }
    };

    it('should save a new handover version', async () => {
        const res = await request(app)
            .post('/api/handover/save')
            .send(sampleHandover);

        expect(res.status).toBe(200);
        expect(res.body.handover.handoverformId).toBe('test-v1');
    });

    it('should list handover history', async () => {
        await Handover.create(sampleHandover);

        const res = await request(app).get('/api/handover/history');
        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('should activate a handover version', async () => {
        await Handover.create(sampleHandover);

        const res = await request(app).post(`/api/handover/activate/${sampleHandover.handoverformId}`);
        expect(res.status).toBe(200);

        const active = await Handover.findOne({ isActive: true });
        expect(active.handoverformId).toBe(sampleHandover.handoverformId);
    });

    it('should get current active handover', async () => {
        await Handover.create({ ...sampleHandover, isActive: true });

        const res = await request(app).get('/api/handover/active');
        expect(res.status).toBe(200);
        expect(res.body.isActive).toBe(true);
    });
});
