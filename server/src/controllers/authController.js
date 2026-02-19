const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

exports.syncUser = async (req, res) => {
    const { googleId, email, name, image } = req.body;

    try {
        let user = await User.findOne({ googleId });

        if (!user) {
            // Create new user
            user = new User({
                googleId,
                email,
                name,
                image
            });
            await user.save();
        }

        // If user exists but has no patient record, try to link or create
        if (!user.patientId) {
            const normalizedName = name.toLowerCase().replace(/\s+/g, '');
            const patients = await Patient.find({
                $or: [
                    { email: email.toLowerCase() },
                    { userId: { $exists: false } }
                ]
            });

            const matchedPatient = patients.find(p => {
                if (p.email === email.toLowerCase()) return true;
                const pNormalized = p.name.toLowerCase().replace(/\s+/g, '');
                return pNormalized === normalizedName;
            });

            if (matchedPatient) {
                user.patientId = matchedPatient._id;
                user.contact = matchedPatient.contact;
                await user.save();

                matchedPatient.userId = user._id;
                if (!matchedPatient.email) matchedPatient.email = email.toLowerCase();
                await matchedPatient.save();
            } else {
                const newPatient = new Patient({
                    name: name,
                    email: email.toLowerCase(),
                    age: 0,
                    contact: '-__-',
                    addedByAdmin: false
                });
                const savedPatient = await newPatient.save();
                user.patientId = savedPatient._id;
                user.contact = savedPatient.contact;
                await user.save();

                savedPatient.userId = user._id;
                await savedPatient.save();
            }
        }
        const upcomingAppointment = await Appointment.findOne({
            patientId: user.patientId,
            status: 'Scheduled',
            isTicked: false
        });

        res.status(200).json({
            ...user.toObject(),
            hasUpcomingAppointment: !!upcomingAppointment
        });
    } catch (error) {
        console.error('Error syncing user:', error);
        res.status(500).json({ message: 'Server error during sync' });
    }
};

exports.updateProfile = async (req, res) => {
    const { userId, name, age, address, alternateContact, contact, gender } = req.body;

    try {
        let user = await User.findOne({ googleId: userId }).populate('patientId');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // If patientId is missing for some reason, create/find one here too
        if (!user.patientId) {
            const newPatient = new Patient({
                name: name || user.name,
                email: user.email,
                age: age || 0,
                gender: gender || '-__-',
                contact: contact || '-__-',
                addedByAdmin: false
            });
            const savedPatient = await newPatient.save();
            user.patientId = savedPatient._id;
            user.contact = savedPatient.contact;
            await user.save();
            user = await User.findById(user._id).populate('patientId');
        }

        let patient = user.patientId;

        // Robust Merging logic: name (normalized) + contact
        if (!patient.addedByAdmin && contact && contact !== '-__-') {
            const normalizedInputName = (name || patient.name).toLowerCase().replace(/\s+/g, '');
            const searchContact = contact.replace(/\s+/g, ''); // Robust contact match

            const existingPatients = await Patient.find({
                $or: [
                    { contact: contact },
                    { contact: searchContact }
                ],
                _id: { $ne: patient._id },
                userId: { $exists: false }
            });

            const matchedRecord = existingPatients.find(p => {
                const pNormalized = p.name.toLowerCase().replace(/\s+/g, '');
                return pNormalized === normalizedInputName;
            });

            if (matchedRecord) {
                matchedRecord.userId = user._id;
                matchedRecord.email = user.email.toLowerCase();
                matchedRecord.name = name || matchedRecord.name;
                matchedRecord.age = age || matchedRecord.age;
                matchedRecord.gender = gender || matchedRecord.gender;
                matchedRecord.address = address || matchedRecord.address;
                matchedRecord.alternateContact = alternateContact || matchedRecord.alternateContact;

                await matchedRecord.save();

                user.patientId = matchedRecord._id;
                user.name = matchedRecord.name;
                user.contact = matchedRecord.contact;
                await user.save();

                await Patient.findByIdAndDelete(patient._id);

                return res.status(200).json({
                    message: 'Profile merged with your existing clinic record!',
                    patient: matchedRecord
                });
            }
        }

        // Standard update
        patient.name = name || patient.name;
        patient.age = age || patient.age;
        patient.gender = gender || patient.gender;
        patient.address = address || patient.address;
        patient.contact = contact || patient.contact;
        patient.alternateContact = alternateContact || patient.alternateContact;

        await patient.save();

        user.name = patient.name;
        user.contact = patient.contact;
        await user.save();

        const upcomingAppointment = await Appointment.findOne({
            patientId: patient._id,
            status: 'Scheduled',
            isTicked: false
        });

        res.status(200).json({
            message: 'Profile updated successfully',
            patient,
            hasUpcomingAppointment: !!upcomingAppointment
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserByGoogleId = async (req, res) => {
    const { googleId } = req.params;
    try {
        let user = await User.findOne({ googleId }).populate('patientId');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Auto-fix orphaned users
        if (!user.patientId) {
            const newPatient = new Patient({
                name: user.name,
                email: user.email,
                age: 0,
                contact: '-__-',
                addedByAdmin: false
            });
            const savedPatient = await newPatient.save();
            user.patientId = savedPatient._id;
            user.contact = savedPatient.contact; // Also update user's contact
            await user.save();
            user = await User.findOne({ googleId }).populate('patientId');
        }

        const upcomingAppointment = await Appointment.findOne({
            patientId: user.patientId._id,
            status: 'Scheduled',
            isTicked: false
        });

        res.status(200).json({
            ...user.toObject(),
            hasUpcomingAppointment: !!upcomingAppointment
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
