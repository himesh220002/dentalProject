const nodemailer = require('nodemailer');

// Node 18+ / 20+ Fix: Force IPv4 as the default DNS result order
// This is more reliable than the 'family' option for cloud networking
require('dns').setDefaultResultOrder('ipv4first');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS for port 587
    pool: true,    // Use pooled connections for better stability
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS
    },
    connectionTimeout: 60000, // Increased to 60 seconds
    greetingTimeout: 60000,
    socketTimeout: 60000,
    // CRITICAL: Force IPv4 at the socket level
    family: 4,
    // EXTREME: Custom DNS lookup to strictly return IPv4 only
    lookup: (hostname, options, callback) => {
        require('dns').lookup(hostname, { family: 4 }, callback);
    }
});

// Verify connection configuration
console.log('--- MAILER SMTP DIAGNOSTIC ---');
console.log('GMAIL_USER:', process.env.GMAIL_USER ? '✔ LOADED' : '✖ MISSING');
console.log('GMAIL_PASS:', process.env.GMAIL_APP_PASS ? '✔ LOADED' : '✖ MISSING');

transporter.verify(function (error, success) {
    if (error) {
        console.log('✖ MAILER FATAL: SMTP Connection Failed.');
        console.log('Reason:', error.message);
    } else {
        console.log('✔ MAILER SUCCESS: SMTP Connection is live and authenticated.');
    }
});

const sendAppointmentEmail = async (patientEmail, patientName, appointmentDetails) => {
    console.log(`Starting email delivery for ${patientEmail}...`);

    if (!patientEmail) {
        console.log('Skipping email notification: Patient has no email address.');
        return;
    }
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASS) {
        console.log('Skipping email notification: GMAIL_USER or GMAIL_APP_PASS not configured.');
        return;
    }

    const { date, time, reason, status } = appointmentDetails;
    const isReschedule = status === 'Rescheduled';

    const mailOptions = {
        from: `"Dr. Tooth Dental Clinic" < ${process.env.GMAIL_USER}> `,
        to: patientEmail,
        subject: isReschedule ? 'Appointment Rescheduled - Dr. Tooth' : 'Appointment Fixed - Dr. Tooth',
        html: `
    < div style = "font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;" >
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
            </div >
    `
    };

    try {
        console.log('Step 3A: Sending payload to Gmail SMTP...');
        const info = await transporter.sendMail(mailOptions);
        console.log('Step 3B: SMTP Handshake successful.');
        console.log(`✔ Notification email sent to ${patientEmail}.MessageId: ${info.messageId} `);
        return info;
    } catch (error) {
        console.error('✖ Step 3B ERROR: SMPT failed at handshake.');
        console.error('ErrorMessage:', error.message);
        console.error('ErrorCode:', error.code || 'N/A');
        console.error('Stack:', error.stack);
        throw error;
    }
};

module.exports = {
    transporter,
    sendAppointmentEmail
};
