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

        if (!user.patientId) {
            const normalizedUserName = name.toLowerCase().replace(/\s+/g, '');

            // 1. Try exact email match first (Priority 1)
            let matchedPatient = await Patient.findOne({ email: email.toLowerCase() });

            // 2. Try name matching for unlinked records (Priority 2)
            if (!matchedPatient) {
                const unlinkedPatients = await Patient.find({ userId: { $exists: false } });
                matchedPatient = unlinkedPatients.find(p => {
                    const pNormalized = p.name.toLowerCase().replace(/\s+/g, '');
                    return pNormalized === normalizedUserName ||
                        normalizedUserName.includes(pNormalized) ||
                        pNormalized.includes(normalizedUserName);
                });
            }

            if (matchedPatient) {
                user.patientId = matchedPatient._id;
                user.contact = matchedPatient.contact !== '-__-' ? matchedPatient.contact : user.contact;
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

        // Robust Merging logic: (name + phone) OR email
        if (!patient.addedByAdmin) {
            const inputName = (name || patient.name).toLowerCase().replace(/\s+/g, '');
            const inputContact = contact ? contact.replace(/\s+/g, '') : '';
            const inputEmail = user.email.toLowerCase();

            // Find candidates for merging: must not have a userId linked yet
            const candidates = await Patient.find({
                _id: { $ne: patient._id },
                userId: { $exists: false }
            });

            const matchedRecord = candidates.find(p => {
                // 1. Match by Email (Priority 1)
                if (p.email && p.email.toLowerCase() === inputEmail) return true;

                // 2. Match by Name + Phone (Priority 2)
                if (inputContact && p.contact && p.contact.replace(/\s+/g, '') === inputContact) {
                    const pNameNormalized = p.name.toLowerCase().replace(/\s+/g, '');
                    return pNameNormalized === inputName ||
                        inputName.includes(pNameNormalized) ||
                        pNameNormalized.includes(inputName);
                }
                return false;
            });

            if (matchedRecord) {
                // Merge data into the matched record
                matchedRecord.userId = user._id;
                matchedRecord.email = inputEmail;
                matchedRecord.name = name || matchedRecord.name;
                matchedRecord.age = age || matchedRecord.age;
                matchedRecord.gender = gender || matchedRecord.gender;
                matchedRecord.address = address || matchedRecord.address;
                matchedRecord.contact = contact || matchedRecord.contact;
                matchedRecord.alternateContact = alternateContact || matchedRecord.alternateContact;

                await matchedRecord.save();

                // Update User's patientId to the existing clinic record
                user.patientId = matchedRecord._id;
                user.name = matchedRecord.name;
                user.contact = matchedRecord.contact;
                await user.save();

                // Delete the placeholder patient record that was created during initial Google Login
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
