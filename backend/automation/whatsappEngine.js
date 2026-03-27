const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

/**
 * Selenium WhatsApp Automation
 */
class WhatsAppEngine {
    constructor(profilePath) {
        this.profilePath = profilePath;
        this.driver = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;

        const options = new chrome.Options();
        if (this.profilePath) {
            options.addArguments(`user-data-dir=${this.profilePath}`);
        }
        options.addArguments('--headless=new');
        options.addArguments('--disable-gpu');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--remote-debugging-port=9222');

        try {
            this.driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(options)
                .build();
            
            await this.driver.get('https://web.whatsapp.com');
            this.isInitialized = true;
            console.log('WhatsApp Web Initialized');
        } catch (error) {
            console.error('Failed to init Selenium:', error.message);
            throw error;
        }
    }

    async sendMessage(phone, message) {
        if (!this.driver) throw new Error('Driver not initialized');

        const chatUrl = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
        
        try {
            await this.driver.get(chatUrl);
            
            // Wait for either the text box OR an invalid number modal
            const result = await this.driver.wait(async (driver) => {
                // Check for text box
                const inputs = await driver.findElements(By.css('div[contenteditable="true"]'));
                if (inputs.length > 0) return { type: 'input', element: inputs[0] };

                // Check for invalid number modal
                const modals = await driver.findElements(By.xpath("//div[contains(text(), 'invalid') or contains(text(), 'Invalid')]"));
                if (modals.length > 0) return { type: 'error', message: 'Invalid phone number' };

                return false;
            }, 15000); // 15s timeout for WhatsApp to load the chat

            if (result.type === 'error') {
                console.log(`WhatsApp Error: ${result.message} for ${phone}`);
                return { success: false, error: result.message };
            }

            // If we have an input, we try to send
            let sendButton;
            const selectors = [
                'span[data-icon="send"]',
                'button.tvf7evbe',
                'button[aria-label="Send"]',
                'footer button'
            ];

            for (const selector of selectors) {
                try {
                    sendButton = await this.driver.findElement(By.css(selector));
                    if (sendButton) break;
                } catch (e) {
                    continue;
                }
            }

            if (!sendButton) {
                console.log('Send button not found, falling back to ENTER...');
                await result.element.sendKeys(Key.ENTER);
            } else {
                await this.driver.sleep(1000);
                await sendButton.click();
            }

            // Wait a bit to ensure it processes
            await this.driver.sleep(2000);
            return { success: true };
        } catch (error) {
            console.error(`Failed to send message to ${phone}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    async quit() {
        if (this.driver) {
            await this.driver.quit();
            this.driver = null;
            this.isInitialized = false;
        }
    }
}

module.exports = WhatsAppEngine;
