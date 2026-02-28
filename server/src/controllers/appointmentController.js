const Appointment = require('../models/Appointment');
const { sendAppointmentEmail } = require('../utils/mailer');

// Get all appointments
exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find().populate('patientId', 'name contact');
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single appointment by ID
exports.getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id).populate('patientId', 'name contact');
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        res.status(200).json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new appointment
exports.createAppointment = async (req, res) => {
    try {
        console.log('--- APPOINTMENT FLOW START ---');
        console.log('Step 0: Validating payload...', req.body);
        console.log('Step 1: Saving initial appointment record...');
        const newAppointment = new Appointment(req.body);
        const savedAppointment = await newAppointment.save();
        console.log('✔ Step 1 PASSED: Record saved with ID', savedAppointment._id);

        const Contact = require('../models/Contact');
        const contactId = req.body.contactId;

        if (contactId) {
            console.log('Step 1.5: Marking contact as Scheduled/Linked...');
            await Contact.findByIdAndUpdate(contactId, {
                status: 'Scheduled',
                appointmentId: savedAppointment._id,
                emailSent: false // Reset until background delivery succeeds
            });
            console.log('✔ Step 1.5 PASSED');
        }

        console.log('Step 2: Fetching patient details for email notification...');
        const populatedApp = await Appointment.findById(savedAppointment._id).populate('patientId');

        let emailSentTo = null;
        if (populatedApp.patientId && populatedApp.patientId.email) {
            emailSentTo = populatedApp.patientId.email;
            console.log('✔ Step 2 PASSED: Email address found -', populatedApp.patientId.email);
            console.log(`Step 3: Triggering background email notification for ${populatedApp.patientId.email}...`);

            // NOTE: We do NOT await this to prevent UI hanging
            sendAppointmentEmail(
                populatedApp.patientId.email,
                populatedApp.patientId.name,
                {
                    date: populatedApp.date,
                    time: populatedApp.time,
                    reason: populatedApp.reason,
                    status: 'Fixed'
                }
            ).then(async (info) => {
                if (info && info.messageId) {
                    console.log('✔ Step 3 PASSED: Background email delivered. MessageId:', info.messageId);
                    if (contactId) {
                        await Contact.findByIdAndUpdate(contactId, { emailSent: true });
                        console.log(`✔ Step 4: Marked Contact ${contactId} as emailSent: true`);
                    }
                }
            }).catch(err => {
                console.error('✖ Step 3 FAILED: Background delivery error:', err.message);
            });
        } else {
            console.log('⚠ Step 2 SKIPPED: No email address found for this patient.');
        }

        console.log('--- APPOINTMENT FLOW COMPLETE ---');
        res.status(201).json({ ...savedAppointment.toObject(), emailSentTo });
    } catch (error) {
        console.error('✖ CRITICAL ERROR (Step 1):', error.message);
        res.status(400).json({ message: error.message });
    }
};

const TreatmentRecord = require('../models/TreatmentRecord');

// Update appointment status and other fields
exports.updateAppointmentStatus = async (req, res) => {
    try {
        console.log('--- RESCHEDULE FLOW START ---');
        console.log('Step 0: Validating update payload...', req.body);
        // Prepare updates
        if (req.body.paymentStatus === 'Paid') {
            req.body.markedPaidAt = new Date(); // Restart timer
        } else if (req.body.paymentStatus && req.body.paymentStatus !== 'Paid') {
            req.body.markedPaidAt = null; // Undo/Clear timer
        }

        if (req.body.status === 'Completed') {
            req.body.completedAt = new Date();
        } else if (req.body.status && req.body.status !== 'Completed') {
            req.body.completedAt = null;
        }

        console.log('Step 1: Updating appointment record...');
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate('patientId');

        if (!updatedAppointment) {
            console.log('✖ Step 1 FAILED: Appointment ID not found');
            return res.status(404).json({ message: 'Appointment not found' });
        }
        console.log('✔ Step 1 PASSED: Record updated');

        const Contact = require('../models/Contact');
        const contactId = req.body.contactId;

        // If this is a reschedule from a message, reset its email status until the new one delivers
        if (contactId && (req.body.date || req.body.time)) {
            await Contact.findByIdAndUpdate(contactId, { emailSent: false });
            console.log('✔ Step 1.5: Reset Contact email status for reschedule.');
        }

        let emailSentTo = null;
        if (req.body.date || req.body.time) {
            console.log('Step 2: Reschedule detected, checking patient email...');
            if (updatedAppointment.patientId && updatedAppointment.patientId.email) {
                emailSentTo = updatedAppointment.patientId.email;
                console.log('✔ Step 2 PASSED: Target email -', updatedAppointment.patientId.email);
                console.log(`Step 3: Triggering background Reschedule email notification for ${updatedAppointment.patientId.email}...`);

                sendAppointmentEmail(
                    updatedAppointment.patientId.email,
                    updatedAppointment.patientId.name,
                    {
                        date: updatedAppointment.date,
                        time: updatedAppointment.time,
                        reason: updatedAppointment.reason,
                        status: 'Rescheduled'
                    }
                ).then(async (info) => {
                    if (info && info.messageId) {
                        console.log('✔ Step 3 PASSED: Background Reschedule email delivered. MessageId:', info.messageId);
                        if (contactId) {
                            await Contact.findByIdAndUpdate(contactId, { emailSent: true });
                            console.log(`✔ Step 4: Marked Contact ${contactId} as emailSent: true (Reschedule)`);
                        }
                    }
                }).catch(err => {
                    console.error('✖ Step 3 FAILED: Background Reschedule error:', err.message);
                });
            } else {
                console.log('⚠ Step 2 SKIPPED: No email found for reschedule notification.');
            }
        }

        // Handle Treatment Record based on paymentStatus
        if (req.body.paymentStatus === 'Paid') {
            console.log('Auto-Record: Creating treatment log...');
            // Check if record already exists for this appointment
            const existingRecord = await TreatmentRecord.findOne({ appointmentId: updatedAppointment._id });

            if (!existingRecord) {
                const autoNotes = `Patient visited for ${updatedAppointment.reason}. Procedure completed and fee of ₹${updatedAppointment.amount} was collected.`;

                await TreatmentRecord.create({
                    patientId: updatedAppointment.patientId._id,
                    appointmentId: updatedAppointment._id,
                    treatmentName: updatedAppointment.reason,
                    cost: updatedAppointment.amount || 0,
                    date: updatedAppointment.date,
                    notes: autoNotes
                });
                console.log('✔ Auto-Record: Created.');
            }
        } else if (req.body.paymentStatus && req.body.paymentStatus !== 'Paid') {
            await TreatmentRecord.findOneAndDelete({ appointmentId: updatedAppointment._id });
            console.log('Auto-Record: Removed (Status reverted from Paid).');
        }

        console.log('--- RESCHEDULE FLOW COMPLETE ---');
        res.status(200).json({ ...updatedAppointment.toObject(), emailSentTo });
    } catch (error) {
        console.error('✖ CRITICAL ERROR (Update Flow):', error.message);
        res.status(400).json({ message: error.message });
    }
};

// Get Collection Stats (Today & This Week)
exports.getAppointmentStats = async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const weekStart = new Date(todayStart);
        weekStart.setDate(todayStart.getDate() - todayStart.getDay()); // Sunday as start of week

        const [todayAppointments, weekAppointments] = await Promise.all([
            Appointment.find({
                date: { $gte: todayStart },
                paymentStatus: 'Paid'
            }),
            Appointment.find({
                date: { $gte: weekStart },
                paymentStatus: 'Paid'
            })
        ]);

        const todayCollection = todayAppointments.reduce((sum, app) => sum + (app.amount || 0), 0);
        const weekCollection = weekAppointments.reduce((sum, app) => sum + (app.amount || 0), 0);

        res.status(200).json({
            todayCollection,
            weekCollection
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get appointments for a specific patient
exports.getAppointmentsByPatientId = async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.params.patientId })
            .populate('patientId', 'name contact')
            .sort({ date: 1, time: 1 });
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Delete an appointment
exports.deleteAppointment = async (req, res) => {
    try {
        const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!deletedAppointment) return res.status(404).json({ message: 'Appointment not found' });
        res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Resend confirmation email
exports.resendConfirmationEmail = async (req, res) => {
    try {
        console.log('--- RESEND EMAIL FLOW START ---');
        const appointmentId = req.params.id;
        const contactId = req.body.contactId;

        const appointment = await Appointment.findById(appointmentId).populate('patientId');
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (!appointment.patientId || !appointment.patientId.email) {
            return res.status(400).json({ message: 'Patient has no email address' });
        }

        console.log(`Step 1: Attempting resend for ${appointment.patientId.email}...`);

        const mailInfo = await sendAppointmentEmail(
            appointment.patientId.email,
            appointment.patientId.name,
            {
                date: appointment.date,
                time: appointment.time,
                reason: appointment.reason,
                status: 'Fixed' // or use specific logic for status
            }
        );

        if (mailInfo && mailInfo.messageId) {
            console.log('✔ Resend PASSED: MessageId', mailInfo.messageId);

            if (contactId) {
                const Contact = require('../models/Contact');
                await Contact.findByIdAndUpdate(contactId, { emailSent: true });
                console.log(`✔ Resend Status Updated: Marked Contact ${contactId} as emailSent: true`);
            }

            return res.status(200).json({ success: true, messageId: mailInfo.messageId });
        } else {
            throw new Error('Mailer returned success but no MessageID was found.');
        }

    } catch (error) {
        console.error('✖ RESEND FATAL ERROR:', error.message);
        res.status(500).json({ message: 'Failed to resend email', error: error.message });
    }
};
