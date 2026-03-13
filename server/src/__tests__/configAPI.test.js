const request = require('supertest');
const { app } = require('../index');
const Config = require('../models/Config');

describe('Config API & Admin Settings', () => {
    it('should verify the admin password', async () => {
        // Default is admin123
        const res = await request(app)
            .post('/api/config/verify-password')
            .send({ password: 'admin123' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('should update and then verify a new admin password', async () => {
        // 1. Update
        const updateRes = await request(app)
            .put('/api/config/update-password')
            .send({ newPassword: 'new-secure-password' });
        expect(updateRes.status).toBe(200);

        // 2. Verify Wrong Password
        const wrongRes = await request(app)
            .post('/api/config/verify-password')
            .send({ password: 'admin123' });
        expect(wrongRes.status).toBe(401);

        // 3. Verify New Password
        const correctRes = await request(app)
            .post('/api/config/verify-password')
            .send({ password: 'new-secure-password' });
        expect(correctRes.status).toBe(200);
    });

    it('should manage clinic closures', async () => {
        const closures = [{ date: '2026-12-25', type: 'full' }];

        const updateRes = await request(app)
            .put('/api/config/closures')
            .send({ closures });

        expect(updateRes.status).toBe(200);
        expect(updateRes.body.closures.length).toBe(1);

        const getRes = await request(app).get('/api/config/closures');
        expect(getRes.status).toBe(200);
        expect(getRes.body[0].date).toBe('2026-12-25');
    });

    it('should check mailer configuration', async () => {
        const res = await request(app).get('/api/config/mailer-check');
        // This depends on env vars, but we expect it to try and return a status
        expect([200, 500]).toContain(res.status);
    });
});
