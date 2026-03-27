const { GoogleGenerativeAI } = require('@google/generative-ai');
const Setting = require('../models/Setting');

const generateMessage = async (userId, lead) => {
    try {
        const settings = await Setting.findOne({ user: userId });
        if (!settings || !settings.geminiApiKey) {
            throw new Error('Gemini API Key not configured in settings');
        }

        const genAI = new GoogleGenerativeAI(settings.geminiApiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const { name, category, location } = lead;
        const demoLink = settings.demoLinks[category.toLowerCase().replace(' ', '')] || '/demo';

        const prompt = `
            Generate a personalized WhatsApp message for a prospective client.
            
            Client Details:
            - Name: ${name}
            - Category: ${category}
            - Location: ${location || 'your area'}
            
            Contextual relevance for ${category}:
            - Dermatologist: trust, skin care, booking flow, patient experience
            - Dentist: appointments, comfort, clean UI, patient trust
            - Psychologist: privacy, calm tone, emotional safety
            - Orthopedic Clinic: mobility, recovery, professionalism

            Rules:
            - Tone: Human-written, professional yet friendly.
            - Length: 3-4 short lines.
            - Content:
                1. Personalized greeting using name/location.
                2. Contextual relevance based on category.
                3. Mention our free demo website for their practice.
                4. Include the demo link: ${demoLink}
                5. Soft CTA (ask for feedback or a quick opinion).
            - NO robotic language, NO spammy hype, NO aggressive sales.
            
            Generate ONLY the message body, no extra text.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.log('Gemini AI failed, using fallback message:', error.message);
        return `Hello ${lead.name}, this is a personalized message for your ${lead.category} practice from DevPhics! Check our demo here: https://devphics-saas.com ${error.message}`;
    }
};

module.exports = { generateMessage };
