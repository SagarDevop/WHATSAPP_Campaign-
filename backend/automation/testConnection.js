const WhatsAppEngine = require('./whatsappEngine');
require('dotenv').config();

async function testConnection() {
    const profilePath = process.env.CHROME_PROFILE_PATH;
    
    if (!profilePath) {
        console.error('Error: CHROME_PROFILE_PATH not found in .env');
        process.exit(1);
    }

    console.log('--- WhatsApp Automation Test ---');
    console.log(`Using Profile Path: ${profilePath}`);
    console.log('Initializing WhatsApp Engine...');

    const engine = new WhatsAppEngine(profilePath);

    try {
        await engine.init();
        console.log('Success! WhatsApp Web loaded.');
        console.log('Please check if you are logged in in the opened browser window.');
        console.log('Closing browser in 10 seconds...');
        
        await new Promise(r => setTimeout(r, 10000));
        await engine.quit();
        console.log('Test completed.');
    } catch (error) {
        console.error('Test failed:', error.message);
        if (engine) await engine.quit();
        process.exit(1);
    }
}

testConnection();
