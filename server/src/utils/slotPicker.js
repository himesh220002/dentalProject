const Appointment = require('../models/Appointment');
const Config = require('../models/Config');
const Handover = require('../models/Handover');

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

    // 3. Define standard slots (9 AM to 8 PM)
    const allSlots = [
        "09:00", "10:00", "11:00", "12:00",
        "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
    ];

    // 3.5. Fetch dynamic lunch time from Handover
    const activeHandover = await Handover.findOne({ isActive: true });
    let lunchTimeRange = "01:00 PM - 02:00 PM"; // Default

    if (activeHandover && activeHandover.jsondata && activeHandover.jsondata.lunchTime) {
        lunchTimeRange = activeHandover.jsondata.lunchTime;
    }

    // Filter out the lunch time slot
    // Assuming lunchTimeRange is like "01:00 PM - 02:00 PM", we exclude the 24h hour(s) it covers
    // Simple logic for single hour ranges or specific starts
    const filteredSlots = allSlots.filter(slot => {
        // Convert range string to start and end hours (24h)
        // e.g., "01:00 PM - 02:00 PM" -> start 13, end 14
        const parseTimeRange = (range) => {
            try {
                const [startPart, endPart] = range.split('-').map(p => p.trim());
                const parseH = (t) => {
                    const [time, period] = t.split(' ');
                    let [h] = time.split(':').map(Number);
                    if (period === 'PM' && h < 12) h += 12;
                    if (period === 'AM' && h === 12) h = 0;
                    return h;
                };
                return [parseH(startPart), parseH(endPart)];
            } catch (e) {
                return [13, 14]; // Fallback to 1 PM
            }
        };

        const [lunchStart, lunchEnd] = parseTimeRange(lunchTimeRange);
        const slotHour = parseInt(slot.split(':')[0]);

        // Exclude if slot falls within lunch range
        if (slotHour >= lunchStart && slotHour < lunchEnd) return false;

        return true;
    });

    // 4. Filter out booked slots and closures
    const availableSlots = filteredSlots.filter(slot => {
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
