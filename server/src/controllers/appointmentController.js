const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Contact = require('../models/Contact');
const TreatmentRecord = require('../models/TreatmentRecord');
const Config = require('../models/Config');
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
        const contactId = req.body.contactId;
        console.log('Step 1: Saving initial appointment record...');
        const newAppointment = new Appointment(req.body);
        const savedAppointment = await newAppointment.save();
        console.log('✔ Step 1 PASSED: Record saved with ID', savedAppointment._id);

        if (contactId) {
            console.log('Step 1.5: Marking contact as Scheduled/Linked...');
            await Contact.findByIdAndUpdate(contactId, {
                status: 'Scheduled',
                appointmentId: savedAppointment._id,
                emailSent: false
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
                        await Contact.findByIdAndUpdate(contactId, {
                            emailSent: true,
                            lastEmailError: null
                        });
                        console.log(`✔ Step 4: Marked Contact ${contactId} as emailSent: true`);
                    }
                }
            }).catch(async (err) => {
                console.error('✖ Step 3 FAILED: Background delivery error:', err.message);
                if (contactId) {
                    await Contact.findByIdAndUpdate(contactId, {
                        emailSent: false,
                        lastEmailError: err.message
                    });
                }
            });
        } else {
            console.log('⚠ Step 2 SKIPPED: No email address found for this patient.');
        }

        console.log('--- APPOINTMENT FLOW COMPLETE ---');

        // Emit real-time event
        const io = req.app.get('socketio');
        if (io) {
            io.emit('newAppointment', { patientId: savedAppointment.patientId });
        }

        // Auto-Record: Check if created as Completed
        if (savedAppointment.status === 'Completed' || savedAppointment.paymentStatus === 'Paid') {
            console.log('Auto-Record (Create): Initializing treatment log...');
            let treatmentName = savedAppointment.reason;
            let notes = "The procedure has been completed with proper measures. No immediate complications were observed. Routine follow-up is advised.";

            const lastParenMatch = savedAppointment.reason.match(/([\s\S]*)\s?\(([\s\S]*)\)\s*$/);
            if (lastParenMatch) {
                treatmentName = lastParenMatch[1].trim();
                notes = lastParenMatch[2].trim() || notes;
            }

            await TreatmentRecord.create({
                patientId: savedAppointment.patientId,
                appointmentId: savedAppointment._id,
                treatmentName: treatmentName,
                cost: savedAppointment.amount || 0,
                date: savedAppointment.date,
                notes: notes
            });
            console.log('✔ Auto-Record (Create): Generated.');
        }

        res.status(201).json({ ...savedAppointment.toObject(), emailSentTo });
    } catch (error) {
        console.error('✖ CRITICAL ERROR (Step 1):', error.message);
        res.status(400).json({ message: error.message });
    }
};


// Update appointment status and other fields
exports.updateAppointmentStatus = async (req, res) => {
    try {
        console.log('--- RESCHEDULE FLOW START ---');
        console.log('Step 0: Validating update payload...', req.body);
        const contactId = req.body.contactId;
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

        // Handle Treatment Record based on status OR paymentStatus
        const isEligibleForRecord = updatedAppointment.status === 'Completed' || updatedAppointment.paymentStatus === 'Paid';

        if (isEligibleForRecord) {
            console.log('Auto-Record: Checking/Creating treatment log...');
            // Check if record already exists for this appointment
            const existingRecord = await TreatmentRecord.findOne({ appointmentId: updatedAppointment._id });

            if (!existingRecord) {
                // Parse reason to extract treatment name and notes
                let treatmentName = updatedAppointment.reason;
                let notes = "The procedure has been completed with proper measures. No immediate complications were observed. Routine follow-up is advised."; // Default 

                const lastParenMatch = updatedAppointment.reason.match(/([\s\S]*)\s?\(([\s\S]*)\)\s*$/);
                if (lastParenMatch) {
                    treatmentName = lastParenMatch[1].trim();
                    notes = lastParenMatch[2].trim() || notes;
                }

                await TreatmentRecord.create({
                    patientId: updatedAppointment.patientId._id || updatedAppointment.patientId,
                    appointmentId: updatedAppointment._id,
                    treatmentName: treatmentName,
                    cost: updatedAppointment.amount || 0,
                    date: updatedAppointment.date,
                    notes: notes
                });
                console.log('✔ Auto-Record: Created.');
            }
        } else {
            // If neither Completed nor Paid, ensure no record exists
            await TreatmentRecord.findOneAndDelete({ appointmentId: updatedAppointment._id });
            console.log('Auto-Record: Removed (Neither Completed nor Paid).');
        }

        console.log('--- RESCHEDULE FLOW COMPLETE ---');

        // Emit real-time event
        const io = req.app.get('socketio');
        if (io) {
            io.emit('updateAppointment', { patientId: updatedAppointment.patientId._id || updatedAppointment.patientId });
        }

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
        const appointmentId = req.params.id;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const isHardDeleteEligible = !['Operating', 'Completed'].includes(appointment.status);

        if (isHardDeleteEligible) {
            // HARD DELETE: Remove completely
            console.log(`--- HARD DELETION START for Appointment: ${appointmentId} ---`);
            await Appointment.findByIdAndDelete(appointmentId);

            // Cleanup History (TreatmentRecord)
            const deletedRecord = await TreatmentRecord.findOneAndDelete({ appointmentId: appointmentId });
            if (deletedRecord) console.log('✔ TreatmentRecord hard-deleted.');

            // Cleanup Contact
            const updatedContact = await Contact.findOneAndUpdate(
                { appointmentId: appointmentId },
                {
                    $set: { status: 'Read' },
                    $unset: { appointmentId: "" }
                },
                { new: true }
            );
            if (updatedContact) console.log('✔ Contact reference cleaned up.');

            console.log('--- HARD DELETION COMPLETE ---');
            return res.status(200).json({ message: 'Appointment and records fully removed.' });
        } else {
            // SOFT DELETE: Keep for Revenue/History but hide from management
            console.log(`--- SOFT DELETION START for Appointment: ${appointmentId} ---`);
            appointment.isDeleted = true;
            await appointment.save();

            console.log('✔ Appointment marked as isDeleted (Soft Delete).');
            console.log('--- SOFT DELETION COMPLETE ---');
            return res.status(200).json({ message: 'Appointment hidden from schedules (soft delete).' });
        }

    } catch (error) {
        console.error('✖ DELETION ERROR:', error.message);
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
                await Contact.findByIdAndUpdate(contactId, {
                    emailSent: true,
                    lastEmailError: null
                });
                console.log(`✔ Resend Status Updated: Marked Contact ${contactId} as emailSent: true`);
            }

            return res.status(200).json({ success: true, messageId: mailInfo.messageId });
        } else {
            console.warn('⚠ Resend SKIPPED: Mailer did not return a messageId (check mailer logs).');
            return res.status(200).json({
                success: false,
                message: 'Email skipped or failed silently. Check server diagnostics.'
            });
        }

    } catch (error) {
        console.error('✖ RESEND FATAL ERROR:', error.message);
        if (req.body.contactId) {
            await Contact.findByIdAndUpdate(req.body.contactId, {
                emailSent: false,
                lastEmailError: error.message
            });
        }
        res.status(500).json({ message: 'Failed to resend email', error: error.message });
    }
};

// Get appointment density (slots per day)
exports.getAppointmentDensity = async (req, res) => {
    try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const limit = parseInt(req.query.days) || 30;
        const end = new Date(start);
        end.setDate(start.getDate() + limit);

        const [appointments, config] = await Promise.all([
            Appointment.find({
                date: { $gte: start, $lt: end },
                status: { $ne: 'Cancelled' }
            }, 'date time'),
            Config.findOne({ key: 'clinic_closures' })
        ]);

        const closures = config ? JSON.parse(config.value) : [];
        const density = {};

        // Initialize density with closures
        closures.forEach((c) => {
            const closureObj = typeof c === 'string' ? { date: c, type: 'full' } : c;
            const date = new Date(closureObj.date).toISOString().split('T')[0];
            if (!density[date]) {
                density[date] = { count: 0, slots: [], closures: [] };
            }
            density[date].closures.push(closureObj);
            if (closureObj.type === 'full') {
                density[date].closed = true;
            }
        });

        appointments.forEach(app => {
            const dateStr = new Date(app.date).toISOString().split('T')[0];
            if (!density[dateStr]) {
                density[dateStr] = { count: 0, slots: [] };
            }
            density[dateStr].count += 1;
            density[dateStr].slots.push(app.time);
        });

        res.status(200).json(density);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Public: Check appointment status without login
exports.publicCheckAppointment = async (req, res) => {
    const { contact, namePrefix } = req.body;

    try {
        if (!contact || contact.length < 10) {
            return res.status(400).json({ message: 'Valid contact number is required.' });
        }

        const cleanContact = contact.replace(/\D/g, '').slice(-10);

        // Find patient(s) matching contact
        const patients = await Patient.find({
            contact: new RegExp(cleanContact + '$')
        });

        if (patients.length === 0) {
            return res.status(404).json({ message: 'No records found for this contact.' });
        }

        // Filter by name if prefix provided (Flexible matching)
        const targetPatients = namePrefix
            ? patients.filter(p => {
                const searchName = namePrefix.toLowerCase();
                const patientName = p.name.toLowerCase();

                // If short search term, stick to strict prefix
                if (searchName.length < 3) return patientName.startsWith(searchName);

                // For terms >= 3 chars, any 3-char sequence match triggers a result
                for (let i = 0; i <= searchName.length - 3; i++) {
                    const sequence = searchName.substring(i, i + 3);
                    if (patientName.includes(sequence)) return true;
                }
                return false;
            })
            : patients;

        if (targetPatients.length === 0) {
            return res.status(404).json({ message: 'Patient name does not match record.' });
        }

        const patientIds = targetPatients.map(p => p._id);

        // Find upcoming appointments
        const appointments = await Appointment.find({
            patientId: { $in: patientIds },
            status: 'Scheduled',
            isTicked: false
        }).sort({ date: 1, time: 1 });

        if (appointments.length === 0) {
            return res.status(404).json({ message: 'No upcoming appointments found.' });
        }

        // Sanitize data (only return basic info)
        const sanitizedApts = appointments.map(apt => {
            const p = targetPatients.find(tp => String(tp._id) === String(apt.patientId));
            return {
                _id: apt._id,
                date: apt.date,
                time: apt.time,
                status: apt.status,
                patientName: (p?.name || 'Patient').replace(/.(?=.{2})/g, '*') // Mask name for privacy
            };
        });

        res.status(200).json(sanitizedApts);
    } catch (error) {
        console.error('Error in public check appointment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
