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

/**
 * Shared Helper: Find and Merge Orphans
 * Checks for patients with no userId that match the provided email/contact.
 * Merges them into the user's primary patient record.
 */
const findAndMergeOrphans = async (user, primaryPatient, inputContact = null) => {
    const normalizedEmail = user.email.toLowerCase();
    const cleanSearchContact = inputContact ? inputContact.replace(/\D/g, '').slice(-10) : (user.contact ? user.contact.replace(/\D/g, '').slice(-10) : '');

    const orphans = await Patient.find({
        _id: { $ne: primaryPatient?._id },
        userId: { $exists: false },
        $or: [
            { email: normalizedEmail },
            ...(cleanSearchContact ? [{ contact: new RegExp(cleanSearchContact + '$') }] : []),
            { name: new RegExp(`^${user.name}$`, 'i') }
        ]
    });

    if (orphans.length > 0) {
        console.log(`[SYNC] Found ${orphans.length} orphan matching record(s) for ${user.email}. Merging...`);

        let targetPatient = primaryPatient;

        // If no primary patient yet, pick the first orphan as primary
        if (!targetPatient) {
            targetPatient = orphans[0];
            targetPatient.userId = user._id;
            targetPatient.email = targetPatient.email || normalizedEmail;
            await targetPatient.save();

            user.patientId = targetPatient._id;
            user.contact = targetPatient.contact !== '-__-' ? targetPatient.contact : user.contact;
            await user.save();

            // Start merging from index 1
            for (let i = 1; i < orphans.length; i++) {
                await mergePatients(targetPatient._id, orphans[i]._id);
            }
        } else {
            // Merge ALL orphans into existing primary
            for (const orphan of orphans) {
                await mergePatients(targetPatient._id, orphan._id);
            }
        }
        return targetPatient;
    }
    return primaryPatient;
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

        // Proactive Sync on Login
        let primaryPatient = user.patientId ? await Patient.findById(user.patientId) : null;
        primaryPatient = await findAndMergeOrphans(user, primaryPatient);

        // 2. Final Fallback: If still no patient linked, create a new one
        if (!user.patientId) {
            const newPatient = new Patient({
                name: name,
                email: email.toLowerCase(),
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

        // Proactive Merging on Update: Check for orphans that match the NEW phone/email
        patient = await findAndMergeOrphans(user, patient, contact);

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

        // Proactive Sync on every fetch (Page Refresh)
        let patient = user.patientId;
        patient = await findAndMergeOrphans(user, patient);

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
            patientId: user.patientId?._id || user.patientId,
            status: 'Scheduled',
            isTicked: false
        });

        res.status(200).json({
            ...user.toObject(),
            hasUpcomingAppointment: !!upcomingAppointment
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.linkByPatientId = async (req, res) => {
    const { userId, patientRecordId } = req.body;

    try {
        const user = await User.findOne({ googleId: userId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        let targetPatient;
        if (patientRecordId.length === 8) {
            // Find by Record ID suffix (last 8 characters of ObjectId)
            // The frontend displays: patientId.slice(-8).toUpperCase()
            targetPatient = await Patient.findOne({
                $expr: {
                    $eq: [
                        { $toUpper: { $substr: [{ $toString: "$_id" }, 16, 8] } },
                        patientRecordId.toUpperCase()
                    ]
                }
            });
        } else if (patientRecordId.length === 24) {
            targetPatient = await Patient.findById(patientRecordId);
        }

        if (!targetPatient) return res.status(404).json({ message: 'Clinical record not found. Please verify the Record ID.' });

        if (targetPatient.userId && String(targetPatient.userId) !== String(user._id)) {
            return res.status(400).json({ message: 'This clinical record is already linked to another account.' });
        }

        const oldPatientId = user.patientId;

        // Link them
        targetPatient.userId = user._id;
        targetPatient.email = targetPatient.email || user.email;
        await targetPatient.save();

        user.patientId = targetPatient._id;
        user.contact = targetPatient.contact !== '-__-' ? targetPatient.contact : user.contact;
        await user.save();

        // If they had a placeholder patient record, merge it into the new "real" one
        if (oldPatientId && String(oldPatientId) !== String(targetPatient._id)) {
            await mergePatients(targetPatient._id, oldPatientId);
        }

        // Proactively merge any other matches found by Phone/Email/Name
        await findAndMergeOrphans(user, targetPatient);

        const updatedUser = await User.findById(user._id).populate('patientId');

        res.status(200).json({
            message: 'Clinical record connected successfully!',
            patient: updatedUser.patientId
        });
    } catch (error) {
        console.error('Error linking patient by ID:', error);
        res.status(500).json({ message: 'Failed to link record. Please ensure the ID is correct.' });
    }
};
