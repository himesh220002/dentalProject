const request = require('supertest');
const { app } = require('../index');
const Treatment = require('../models/Treatment');
const Patient = require('../models/Patient');
const TreatmentRecord = require('../models/TreatmentRecord');

describe('Treatments & Records API', () => {
    it('should get all treatments', async () => {
        await Treatment.create({
            name: 'Scaling',
            price: '800',
            description: 'Scale and clean',
            whyNeed: 'Prevent gum disease',
            icon: 'FaMagic'
        });

        const res = await request(app).get('/api/treatments');
        expect(res.status).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe('Scaling');
    });

    it('should seed treatments successfully', async () => {
        const res = await request(app).post('/api/treatments/seed');
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Treatments seeded successfully');
        expect(res.body.count).toBeGreaterThan(0);
    });

    it('should manage treatment records for a patient', async () => {
        // 1. Create patient
        const patient = await Patient.create({ name: 'History Patient', age: 40, contact: '9988776655' });

        // 2. Create treatment record
        const recordData = {
            patientId: patient._id,
            treatmentName: 'Root Canal',
            cost: 3500,
            date: new Date().toISOString(),
            notes: 'Initial session'
        };

        const createRes = await request(app)
            .post('/api/treatment-records')
            .send(recordData);

        expect(createRes.status).toBe(201);
        expect(createRes.body.treatmentName).toBe('Root Canal');
        const recordId = createRes.body._id;

        // 3. Get records by patient
        const getRes = await request(app).get(`/api/treatment-records/patient/${patient._id}`);
        expect(getRes.status).toBe(200);
        expect(getRes.body.length).toBe(1);

        // 4. Update record (using 'notes' instead of non-existent 'status')
        const updateRes = await request(app)
            .put(`/api/treatment-records/${recordId}`)
            .send({ notes: 'Follow-up scheduled' });
        expect(updateRes.status).toBe(200);
        expect(updateRes.body.notes).toBe('Follow-up scheduled');

        // 5. Delete record
        const deleteRes = await request(app).delete(`/api/treatment-records/${recordId}`);
        expect(deleteRes.status).toBe(200);
        expect(deleteRes.body.message).toBe('Record deleted successfully');
    });
});
