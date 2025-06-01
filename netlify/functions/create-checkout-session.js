const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
        // Add CSP headers
        'Content-Security-Policy': "default-src 'self' https://*.stripe.com https://*.stripe.network;"
    };

    if (event.httpMethod === 'OPTIONS') {
        return { 
            statusCode: 200, 
            headers 
        };
    }

    if (event.httpMethod !== 'POST') {
        return { 
            statusCode: 405, 
            headers, 
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        if (!event.body) {
            throw new Error('Missing request body');
        }

        const { customerEmail } = JSON.parse(event.body);

        if (!customerEmail) {
            throw new Error('Customer email is required');
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID, // Move price ID to environment variable
                    quantity: 1,
                },
            ],
            success_url: `${process.env.URL}/success`,
            cancel_url: `${process.env.URL}/cancel`,
            customer_email: customerEmail,
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                id: session.id,
                url: session.url 
            })
        };
    } catch (error) {
        console.error('Checkout error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: error.message || 'Internal server error'
            })
        };
    }
};