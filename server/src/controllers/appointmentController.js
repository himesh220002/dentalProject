const Appointment = require('../models/Appointment');

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
        const newAppointment = new Appointment(req.body);
        const savedAppointment = await newAppointment.save();
        res.status(201).json(savedAppointment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const TreatmentRecord = require('../models/TreatmentRecord');

// Update appointment status and other fields
exports.updateAppointmentStatus = async (req, res) => {
    try {
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

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate('patientId', 'name contact');

        if (!updatedAppointment) return res.status(404).json({ message: 'Appointment not found' });

        // Handle Treatment Record based on paymentStatus
        if (req.body.paymentStatus === 'Paid') {
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
            }
        } else if (req.body.paymentStatus && req.body.paymentStatus !== 'Paid') {
            // If it was Paid but now it's something else, we might want to remove the auto-record
            // Only if it was an auto-record (matching the notes pattern or just by appointmentId)
            await TreatmentRecord.findOneAndDelete({ appointmentId: updatedAppointment._id });
        }

        res.status(200).json(updatedAppointment);
    } catch (error) {
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
