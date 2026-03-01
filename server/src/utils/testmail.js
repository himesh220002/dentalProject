require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('--- STANDALONE SMTP TEST START ---');
console.log('User:', process.env.GMAIL_USER);
console.log('Target:', 'versionname4@gmail.com');

const testSMTP = async (port, secure) => {
    console.log(`\nTesting Port ${port} (Secure: ${secure})...`);

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: port,
        secure: secure,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASS
        },
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000,
        family: 4 // Standard IPv4
    });

    try {
        console.log(`Step 1: Verifying transporter on port ${port}...`);
        await transporter.verify();
        console.log(`✔ Step 1: Verification Successful!`);

        console.log(`Step 2: Sending test email...`);
        const info = await transporter.sendMail({
            from: `"Dr. Tooth Test" <${process.env.GMAIL_USER}>`,
            to: 'versionname4@gmail.com',
            subject: `SMTP Test - Port ${port}`,
            text: `This is a test email sent during diagnostics on Port ${port}.`,
            html: `<b>This is a test email sent during diagnostics on Port ${port}.</b>`
        });
        console.log(`✔ Step 2: Email sent! MessageId: ${info.messageId}`);
    } catch (error) {
        console.error(`✖ FAILED on Port ${port}:`, error.message);
        if (error.code) console.error(`Code: ${error.code}`);
    }
};

const runTests = async () => {
    // Test 587 first as requested
    await testSMTP(587, false);

    // Then test 465 as a comparison
    await testSMTP(465, true);

    console.log('\n--- DIAGNOSTICS COMPLETE ---');
    process.exit(0);
};

runTests();
