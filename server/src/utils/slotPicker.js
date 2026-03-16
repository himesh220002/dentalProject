const Appointment = require('../models/Appointment');
const Config = require('../models/Config');

/**
 * Finds available time slots for a specific date.
 * @param {string} dateStr - The date in YYYY-MM-DD format.
 * @returns {Promise<string[]>} - Array of available time strings (e.g., ["09:00", "10:00"]).
 */
const getAvailableSlots = async (dateStr) => {
    // 1. Fetch existing appointments for the date
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
    const nextDate = new Date(targetDate);
    nextDate.setDate(targetDate.getDate() + 1);

    const appointments = await Appointment.find({
        date: { $gte: targetDate, $lt: nextDate },
        status: { $ne: 'Cancelled' }
    });

    const bookedTimes = appointments.map(app => app.time); // Assuming format "HH:mm" or "HH:mm AM/PM"

    // 2. Fetch closures
    const config = await Config.findOne({ key: 'clinic_closures' });
    const closures = config ? JSON.parse(config.value) : [];

    const isClosed = closures.some(c => {
        const closureDate = new Date(c.date).toISOString().split('T')[0];
        return closureDate === dateStr && c.type === 'full';
    });

    if (isClosed) return [];

    const partialClosures = closures.filter(c => {
        const closureDate = new Date(c.date).toISOString().split('T')[0];
        return closureDate === dateStr && c.type === 'partial';
    });

    // 3. Define standard slots (9 AM to 8 PM, excluding 1 PM break)
    // TODO: Dynamically fetch from active handover timings if possible
    const allSlots = [
        "09:00", "10:00", "11:00", "12:00",
        "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
    ];

    // 4. Filter out booked slots and closures
    const availableSlots = allSlots.filter(slot => {
        // Check if booked
        const isBooked = bookedTimes.some(bt => bt.startsWith(slot));
        if (isBooked) return false;

        // Check if in partial closure
        const inPartialClosure = partialClosures.some(pc => {
            const slotHour = parseInt(slot.split(':')[0]);
            const startHour = parseInt(pc.startTime.split(':')[0]);
            const endHour = parseInt(pc.endTime.split(':')[0]);
            return slotHour >= startHour && slotHour < endHour;
        });
        if (inPartialClosure) return false;

        return true;
    });

    return availableSlots;
};

module.exports = { getAvailableSlots };
