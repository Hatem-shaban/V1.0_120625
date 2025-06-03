const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { operation, params } = JSON.parse(event.body);
        let response;

        switch (operation) {
            case 'generateBusinessNames':
                response = await generateBusinessNames(params);
                break;
            case 'generateLogo':
                response = await generateLogo(params);
                break;
            // Add other AI operations here
            default:
                throw new Error('Invalid operation');
        }

        return {
            statusCode: 200,
            body: JSON.stringify(response)
        };
    } catch (error) {
        console.error('AI Operation error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
}

async function generateBusinessNames({ industry, keywords }) {
    const prompt = `Generate 10 creative, brandable business names for a ${industry} company. Keywords: ${keywords}. Format as JSON array.`;
    
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
    });

    return completion.data.choices[0].message.content;
}