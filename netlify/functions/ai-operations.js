const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

exports.handler = async function(event, context) {
    // Add CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    if (event.httpMethod !== 'POST') {
        return { 
            statusCode: 405, 
            headers,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const { operation, params } = JSON.parse(event.body);
        
        // Validate required parameters
        if (!operation) {
            throw new Error('Operation is required');
        }

        let response;
        switch (operation) {
            case 'generateBusinessNames':
                response = await generateBusinessNames(params);
                break;
            case 'generateLogo':
                response = await generateLogo(params);
                break;
            default:
                throw new Error(`Invalid operation: ${operation}`);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ data: response })
        };
    } catch (error) {
        console.error('AI Operation error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            })
        };
    }
};

async function generateBusinessNames({ industry, keywords }) {
    if (!industry || !keywords) {
        throw new Error('Industry and keywords are required');
    }

    const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ 
            role: "user", 
            content: `Generate 10 creative, brandable business names for a ${industry} company. Keywords: ${keywords}. Format as JSON array.`
        }],
        temperature: 0.7,
        max_tokens: 500
    });

    return completion.choices[0].message.content;
}