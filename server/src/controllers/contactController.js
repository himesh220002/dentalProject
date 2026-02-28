const Contact = require('../models/Contact');
const Patient = require('../models/Patient');

// Submit a new contact message
exports.submitContact = async (req, res) => {
    try {
        const { name, phone, email, message } = req.body;

        // Tag as "prev" if patient exists with this phone
        const existingPatient = await Patient.findOne({ contact: phone });
        const patientType = existingPatient ? 'prev' : 'new';

        const newContact = new Contact({ name, phone, email, message, patientType });
        await newContact.save();
        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all contact messages (for doctor)
exports.getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(req.params.id, { status: 'Read' }, { new: true });
        if (!contact) return res.status(404).json({ message: 'Message not found' });
        res.status(200).json(contact);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
// Mark message as scheduled
exports.markAsScheduled = async (req, res) => {
    try {
        const { appointmentId, emailSent } = req.body;
        console.log(`Linking Message ${req.params.id} to Appointment ${appointmentId}... (EmailSent: ${emailSent})`);
        const updateData = { status: 'Scheduled' };
        if (appointmentId) updateData.appointmentId = appointmentId;
        if (emailSent !== undefined) updateData.emailSent = emailSent;

        const contact = await Contact.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!contact) return res.status(404).json({ message: 'Message not found' });
        res.status(200).json(contact);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
