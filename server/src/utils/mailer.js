const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);

const mg = mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY
});

const DOMAIN = process.env.MAILGUN_DOMAIN;

// Verify configuration on startup
console.log('--- MAILER API DIAGNOSTIC ---');
console.log('MAILGUN_DOMAIN:', DOMAIN ? '✔ LOADED' : '✖ MISSING');
console.log('MAILGUN_API_KEY:', process.env.MAILGUN_API_KEY ? '✔ LOADED' : '✖ MISSING');

if (!DOMAIN || !process.env.MAILGUN_API_KEY) {
    console.warn('⚠ MAILER WARNING: Mailgun credentials missing. Emails will not be sent.');
}

const sendAppointmentEmail = async (patientEmail, patientName, appointmentDetails) => {
    console.log(`Starting email delivery for ${patientEmail} via Mailgun API...`);

    if (!patientEmail) {
        console.log('Skipping email notification: Patient has no email address.');
        return;
    }

    if (!DOMAIN || !process.env.MAILGUN_API_KEY) {
        console.log('Skipping email notification: Mailgun API not configured.');
        return;
    }

    const { date, time, reason, status } = appointmentDetails;
    const isReschedule = status === 'Rescheduled';

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #2563eb; color: white; padding: 24px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">Dr. Tooth Dental Clinic</h1>
            </div>
            <div style="padding: 24px; color: #1e293b;">
                <h2 style="color: #1e40af;">Hello ${patientName},</h2>
                <p style="font-size: 16px; line-height: 1.5;">
                    Your appointment has been ${isReschedule ? 'successfully rescheduled' : 'fixed'}. Here are the final details:
                </p>
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-top: 20px;">
                    <p style="margin: 8px 0;"><strong>📅 Date:</strong> ${new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p style="margin: 8px 0;"><strong>⏰ Time:</strong> ${time}</p>
                    <p style="margin: 8px 0;"><strong>🦷 Treatment:</strong> ${reason}</p>
                </div>
                <p style="margin-top: 24px; font-size: 14px; color: #64748b;">
                    Please arrive 10 minutes prior to your scheduled time. If you need to change your appointment, please call us directly.
                </p>
            </div>
            <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
                &copy; 2026 Dr. Tooth Dental Clinic. All rights reserved.
            </div>
        </div>
    `;

    const data = {
        from: `Dr. Tooth Dental Clinic <mailgun@${DOMAIN}>`,
        to: [patientEmail],
        subject: isReschedule ? 'Appointment Rescheduled - Dr. Tooth' : 'Appointment Fixed - Dr. Tooth',
        html: htmlContent
    };

    try {
        console.log('Step 3A: Sending payload to Mailgun API...');
        const info = await mg.messages.create(DOMAIN, data);
        console.log('Step 3B: Mailgun API accepted the message.');
        console.log(`✔ Notification email queued for ${patientEmail}. Message ID: ${info.id}`);

        // Match the info structure expected by controllers (info.messageId)
        return {
            ...info,
            messageId: info.id // Compatibility with previous code
        };
    } catch (error) {
        console.error('✖ Step 3B ERROR: Mailgun API request failed.');
        console.error('ErrorMessage:', error.message);
        throw error;
    }
};

module.exports = {
    sendAppointmentEmail
};
