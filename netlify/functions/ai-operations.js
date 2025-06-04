const { Configuration, OpenAIApi } = require('openai');

// Validate OpenAI API key
if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OpenAI API key');
}

// Initialize OpenAI with error handling
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    try {
        if (event.httpMethod !== 'POST') {
            throw new Error('Method not allowed');
        }

        const { operation, params } = JSON.parse(event.body);

        if (!operation) {
            throw new Error('Operation type is required');
        }

        let prompt;
        switch (operation) {
            case 'generateBusinessNames':
                prompt = `Generate 5 creative business names for a ${params.industry} startup:`;
                break;
            case 'generateEmailTemplates':
                prompt = `Write a professional email template for ${params.purpose}:`;
                break;
            default:
                throw new Error('Invalid operation type');
        }

        const response = await openai.createCompletion({
            model: 'gpt-3.5-turbo-instruct',
            prompt: prompt,
            max_tokens: 150,
            temperature: 0.7
        });

        if (!response.data.choices || !response.data.choices[0]) {
            throw new Error('No response from AI service');
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                result: response.data.choices[0].text.trim()
            })
        };

    } catch (error) {
        console.error('AI operation error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message,
                details: process.env.NODE_ENV === 'development' ? error : undefined
            })
        };
    }
};