const Contact = require('../models/Contact');
const Patient = require('../models/Patient');
const User = require('../models/User');
const Config = require('../models/Config');
const Appointment = require('../models/Appointment');
const { getAvailableSlots } = require('../utils/slotPicker');

// Submit a new contact message
exports.submitContact = async (req, res) => {
    try {
        const { name, phone, email, message, userId, requestedDate, requestedTime, requestedTreatment, amount } = req.body;

        // Ensure message is present to satisfy schema validation
        const finalMessage = message || `Automated booking for ${requestedTreatment || 'General Consultation'}`;

        // 1. If user is logged in (googleId sent as userId), sync their profile contact if it's missing
        if (userId) {
            const user = await User.findOne({ googleId: userId }).populate('patientId');
            if (user && user.patientId && user.patientId.contact === '-__-') {
                console.log(`Syncing profile contact for Patient ${user.patientId._id} -> ${phone}`);
                await Patient.findByIdAndUpdate(user.patientId._id, { contact: phone });
            }
        }

        // 2. Find or create patient for EVERY enquiry (Manual or Automated)
        let existingPatient = await Patient.findOne({ contact: phone });

        // If phone not found, check by email if provided
        if (!existingPatient && email && email !== '-__-') {
            existingPatient = await Patient.findOne({ email: email.toLowerCase() });
        }

        let patientId = existingPatient ? existingPatient._id : null;
        if (!patientId) {
            console.log(`Creating new patient profile for enquiry: ${name} (${phone})`);
            const newPatient = new Patient({
                name,
                contact: phone,
                email: email || '-__-',
                age: 0,
                gender: '-__-',
                address: '-__-',
                medicalHistory: [],
                addedByAdmin: false
            });
            const savedPatient = await newPatient.save();
            patientId = savedPatient._id;
        }

        const patientType = existingPatient ? 'prev' : 'new';

        // 3. Automated Booking Logic
        let automatedAppointment = null;
        const autoBookingConfig = await Config.findOne({ key: 'automated_booking' });
        const isAutomated = autoBookingConfig && autoBookingConfig.value === 'true';

        if (isAutomated && requestedDate && requestedTime) {
            console.log(`Automated Booking Triggered for ${name} (${phone}) on ${requestedDate} at ${requestedTime}`);

            // Check availability
            const availableSlots = await getAvailableSlots(requestedDate);
            const isAvailable = availableSlots.some(s => requestedTime.startsWith(s));

            if (isAvailable) {
                // Create appointment
                const newAppointment = new Appointment({
                    patientId,
                    date: new Date(requestedDate),
                    time: requestedTime,
                    reason: requestedTreatment || 'General Consultation',
                    status: 'Scheduled',
                    amount: amount || 0,
                    isAutoBooked: true,
                    isViewed: false
                });
                automatedAppointment = await newAppointment.save();
                console.log(`✔ Automated Appointment Created: ${automatedAppointment._id} with amount ${amount || 0}`);
            } else {
                console.warn(`⚠ Requested slot ${requestedTime} on ${requestedDate} is no longer available. Falling back to manual enquiry.`);
            }
        }

        const newContact = new Contact({
            name,
            phone,
            email,
            message: finalMessage,
            patientType,
            requestedTreatment,
            requestedDate: requestedDate ? new Date(requestedDate) : null,
            requestedTime,
            status: automatedAppointment ? 'Scheduled' : 'Unread',
            appointmentId: automatedAppointment ? automatedAppointment._id : null,
            patientId: patientId
        });
        await newContact.save();

        // Emit real-time event
        const io = req.app.get('socketio');
        if (io) {
            io.emit('newContact', newContact);
            if (automatedAppointment) {
                io.emit('newAppointment', {
                    appointmentId: automatedAppointment._id,
                    patientId: patientId
                });
            }
        }

        res.status(201).json({
            message: automatedAppointment ? 'Appointment booked successfully!' : 'Message sent successfully',
            appointmentId: automatedAppointment ? automatedAppointment._id : null,
            isAutomated: !!automatedAppointment
        });
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
        const contact = await Contact.findByIdAndUpdate(req.params.id, { status: 'Read' }, { returnDocument: 'after' });
        if (!contact) return res.status(404).json({ message: 'Message not found' });

        // Emit real-time event
        const io = req.app.get('socketio');
        if (io) {
            io.emit('updateContact', contact);
        }

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

        const contact = await Contact.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after' });
        if (!contact) return res.status(404).json({ message: 'Message not found' });

        // Emit real-time event
        const io = req.app.get('socketio');
        if (io) {
            io.emit('updateContact', contact);
        }

        res.status(200).json(contact);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
