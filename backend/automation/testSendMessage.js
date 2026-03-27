const WhatsAppEngine = require('./whatsappEngine');
require('dotenv').config();

async function testSendMessage() {
    const profilePath = process.env.CHROME_PROFILE_PATH;
    const phone = process.argv[2]; // e.g. 919876543210
    const message = "Hello from DevPhics AI SaaS! This is an automated test message.";

    if (!profilePath) {
        console.error('Error: CHROME_PROFILE_PATH not found in .env');
        process.exit(1);
    }

    if (!phone) {
        console.error('Error: Please provide a phone number as an argument.');
        console.error('Usage: node automation/testSendMessage.js <phone_number>');
        process.exit(1);
    }

    console.log(`--- WhatsApp Message Test ---`);
    console.log(`Profile Path: ${profilePath}`);
    console.log(`Recipient: ${phone}`);
    console.log(`Message: "${message}"`);
    console.log('Initializing WhatsApp Engine...');

    const engine = new WhatsAppEngine(profilePath);

    try {
        await engine.init();
        console.log('Sending message...');
        const result = await engine.sendMessage(phone, message);

        if (result.success) {
            console.log('Success! Message sent successfully.');
        } else {
            console.error('Failed to send message:', result.error);
        }

        console.log('Closing browser in 5 seconds...');
        await new Promise(r => setTimeout(r, 5000));
        await engine.quit();
        console.log('Test completed.');
    } catch (error) {
        console.error('Test failed:', error.message);
        if (engine) await engine.quit();
        process.exit(1);
    }
}

testSendMessage();
