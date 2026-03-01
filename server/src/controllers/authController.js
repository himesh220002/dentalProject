const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const TreatmentRecord = require('../models/TreatmentRecord');

/**
 * Helper to merge orphan patient records into a primary record
 * Transfers all appointments and treatment records.
 */
const mergePatients = async (primaryId, orphanId) => {
    if (String(primaryId) === String(orphanId)) return;

    console.log(`--- [MERGE] Moving data from orphan ${orphanId} to primary ${primaryId} ---`);

    // 1. Update all Appointments
    const aptUpdate = await Appointment.updateMany(
        { patientId: orphanId },
        { patientId: primaryId }
    );
    console.log(`✔ Moved ${aptUpdate.modifiedCount} appointments`);

    // 2. Update all Treatment Records
    const recordUpdate = await TreatmentRecord.updateMany(
        { patientId: orphanId },
        { patientId: primaryId }
    );
    console.log(`✔ Moved ${recordUpdate.modifiedCount} treatment records`);

    // 3. Delete the orphan
    await Patient.findByIdAndDelete(orphanId);
    console.log(`✔ Deleted orphan patient record ${orphanId}`);
};

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

        const normalizedEmail = email.toLowerCase();
        const normalizedUserName = name.toLowerCase().replace(/\s+/g, '');

        // 1. Find the Best Patient Match (Priority 1: Email, Priority 2: Name)
        let primaryPatient = user.patientId ? await Patient.findById(user.patientId) : null;

        // Find ALL orphans (no userId) that match email or name
        const orphans = await Patient.find({
            userId: { $exists: false },
            $or: [
                { email: normalizedEmail },
                { name: new RegExp(`^${name}$`, 'i') }
            ]
        });

        if (orphans.length > 0) {
            console.log(`Found ${orphans.length} potential orphan match(es) for ${email}`);

            // If user has no patient or current is a placeholder, pick the first orphan as primary
            if (!primaryPatient || !primaryPatient.addedByAdmin) {
                const bestOrphan = orphans[0];

                // If existing primary is different and not admin-added, move its data later
                const oldPatientId = primaryPatient ? primaryPatient._id : null;

                // Link user to the "best" orphan record
                user.patientId = bestOrphan._id;
                user.contact = bestOrphan.contact !== '-__-' ? bestOrphan.contact : user.contact;
                await user.save();

                bestOrphan.userId = user._id;
                if (!bestOrphan.email) bestOrphan.email = normalizedEmail;
                await bestOrphan.save();

                primaryPatient = bestOrphan;

                // If we had a previous non-admin placeholder, merge it into the new primary
                if (oldPatientId && String(oldPatientId) !== String(bestOrphan._id)) {
                    await mergePatients(bestOrphan._id, oldPatientId);
                }

                // Merge all OTHER matching orphans into this new primary
                for (let i = 1; i < orphans.length; i++) {
                    await mergePatients(bestOrphan._id, orphans[i]._id);
                }
            } else {
                // User already has an Admin-added record, just merge all orphans into it
                for (const orphan of orphans) {
                    await mergePatients(primaryPatient._id, orphan._id);
                }
            }
        }

        // 2. Final Fallback: If still no patient linked, create a new one
        if (!user.patientId) {
            const newPatient = new Patient({
                name: name,
                email: normalizedEmail,
                age: 0,
                contact: '-__-',
                addedByAdmin: false,
                userId: user._id
            });
            const savedPatient = await newPatient.save();
            user.patientId = savedPatient._id;
            await user.save();
            primaryPatient = savedPatient;
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

        if (!user.patientId) {
            const newPatient = new Patient({
                name: name || user.name,
                email: user.email,
                age: age || 0,
                gender: gender || '-__-',
                contact: contact || '-__-',
                addedByAdmin: false,
                userId: user._id
            });
            await newPatient.save();
            user.patientId = newPatient._id;
            user.contact = newPatient.contact;
            await user.save();
            user = await User.findById(user._id).populate('patientId');
        }

        let patient = user.patientId;

        // Robust Merging on Update: Check for orphans that match the NEW phone/email
        if (!patient.addedByAdmin) {
            const inputContact = contact ? contact.replace(/\D/g, '').slice(-10) : '';
            const normalizedEmail = user.email.toLowerCase();

            const candidates = await Patient.find({
                _id: { $ne: patient._id },
                userId: { $exists: false },
                $or: [
                    { email: normalizedEmail },
                    { contact: new RegExp(inputContact + '$') }
                ]
            });

            if (candidates.length > 0) {
                console.log(`Profile update found ${candidates.length} matching record(s) to merge.`);

                // Pick the first candidate as the record to merge INTO if it's "better" (e.g. has contact)
                // Actually, it's safer to merge ALL orphans into the current USER profile record
                for (const candidate of candidates) {
                    await mergePatients(patient._id, candidate._id);
                }
            }
        }

        // Standard update
        patient.name = name || patient.name;
        patient.age = age || (patient.age === 0 ? age : patient.age);
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

        if (!user.patientId) {
            const newPatient = new Patient({
                name: user.name,
                email: user.email,
                age: 0,
                contact: '-__-',
                addedByAdmin: false,
                userId: user._id
            });
            await newPatient.save();
            user.patientId = newPatient._id;
            user.contact = newPatient.contact;
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
