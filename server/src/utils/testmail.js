console.log('TRACE: Loading dotenv...');
require('dotenv').config();
console.log('TRACE: Loading form-data...');
const formData = require('form-data');
console.log('TRACE: Loading mailgun.js...');
const Mailgun = require('mailgun.js');
console.log('TRACE: Initializing Mailgun...');
const mailgun = new Mailgun(formData);

const DOMAIN = process.env.MAILGUN_DOMAIN;
const API_KEY = process.env.MAILGUN_API_KEY;

const testMailgun = async (url) => {
    const region = url.includes('eu') ? 'EU' : 'US';
    console.log(`\n--- Testing Mailgun ${region} Region ---`);

    const mg = mailgun.client({
        username: 'api',
        key: API_KEY,
        url: url
    });

    try {
        const TARGET = 'versionname4@gmail.com';
        console.log(`Step 1: Sending test email via Mailgun ${region} API...`);
        const info = await mg.messages.create(DOMAIN, {
            from: `Mailgun Sandbox <postmaster@${DOMAIN}>`,
            to: [TARGET],
            subject: `Mailgun ${region} API Test`,
            text: 'Congratulations, you just sent an email with Mailgun!',
            html: '<b>Congratulations, you just sent an email with Mailgun!</b>'
        });
        console.log(`✔ SUCCESS on ${region}: Email queued! ID: ${info.id}`);
        return true;
    } catch (error) {
        console.error(`✖ FAILED on ${region}:`, error.message);
        return false;
    }
};

const run = async () => {
    console.log('--- STANDALONE MAILGUN API DIAGNOSTICS ---');
    console.log('Domain:', DOMAIN);

    if (!DOMAIN || !API_KEY) {
        console.error('✖ CRITICAL: MAILGUN_DOMAIN or MAILGUN_API_KEY missing from .env');
        process.exit(1);
    }

    // Try US first (default)
    const usSuccess = await testMailgun('https://api.mailgun.net');

    if (!usSuccess) {
        // Try EU if US fails
        console.log('\nUS failed, attempting EU region...');
        const euSuccess = await testMailgun('https://api.eu.mailgun.net');

        if (!euSuccess) {
            console.log('\n--- 🛑 TROUBLESHOOTING TIPS ---');
            console.log('1. SANDBOX RESTRICTION: Go to Mailgun Dashboard -> Sending -> Overview.');
            console.log('   Click "Authorized Recipients" and add [versionname4@gmail.com].');
            console.log('   You MUST click the confirmation link in the email Mailgun sends you!');
            console.log('2. API KEY: Ensure your PRIVATE API Key is correct (starts with "key-").');
            console.log('3. DOMAIN: Ensure your domain is correct (e.g. sandboxXXXX.mailgun.org).');
        }
    }

    console.log('\n--- DIAGNOSTICS COMPLETE ---');
    process.exit(0);
};

console.log('TRACE: Starting run()...');
run();
