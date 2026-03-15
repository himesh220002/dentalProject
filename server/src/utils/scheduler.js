const cron = require('node-cron');
const Appointment = require('../models/Appointment');

/**
 * Initializes the daily appointment cleanup job.
 * Runs every day at 19:00 (7 PM).
 */
const initSchedules = () => {
    console.log('📅 Scheduler Service: Initialized');

    // Run at 19:30 (7:30 PM) daily
    // We wait until 7:30 PM to give a 30-minute grace period for the final 7 PM appointment slot.
    cron.schedule('30 19 * * *', async () => {
        console.log('🕒 7:30 PM Daily Cleanup: Starting auto-cancellation job...');

        try {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const todayEnd = new Date(todayStart);
            todayEnd.setHours(23, 59, 59, 999);

            // Find appointments for TODAY that are Scheduled and not yet ticked/completed
            const result = await Appointment.updateMany(
                {
                    date: { $gte: todayStart, $lte: todayEnd },
                    status: 'Scheduled',
                    isTicked: false
                },
                {
                    $set: { status: 'Cancelled' }
                }
            );

            console.log(`✅ 7 PM Daily Cleanup: Job complete. ${result.modifiedCount} unfulfilled appointments cancelled.`);
        } catch (error) {
            console.error('❌ 7 PM Daily Cleanup: Job failed:', error.message);
        }
    });

    console.log('✅ Daily 7 PM Auto-Cancellation CRON Job scheduled.');
};

module.exports = { initSchedules };
