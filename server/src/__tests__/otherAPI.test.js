const request = require('supertest');
const { app } = require('../index');

describe('Appointments & Contacts API', () => {
    let patientId;

    beforeAll(async () => {
        // Create a patient first for appointment tests
        const patientRes = await request(app)
            .post('/api/patients')
            .send({
                name: 'Test Patient',
                age: 25,
                contact: '9999999999',
                email: 'test@patient.com'
            });
        patientId = patientRes.body._id;
    });

    it('should create a new appointment', async () => {
        const appointmentData = {
            patientId: patientId,
            date: new Date().toISOString(),
            time: '11:00 AM',
            reason: 'Routine Checkup',
            amount: 500
        };

        const res = await request(app)
            .post('/api/appointments')
            .send(appointmentData);

        expect(res.status).toBe(201);
        expect(res.body.reason).toBe('Routine Checkup');
    });

    it('should submit a contact message', async () => {
        const messageData = {
            name: 'John Inquiry',
            email: 'john@inquiry.com',
            phone: '1234567890',
            message: 'Looking for a consultation'
        };

        const res = await request(app)
            .post('/api/contacts')
            .send(messageData);

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Message sent successfully');
    });
});
