const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
        'Content-Security-Policy': `
            default-src 'self';
            script-src 'self' https://*.stripe.com https://*.skypack.dev 'unsafe-inline';
            style-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com 'unsafe-inline';
            img-src 'self' data: https://*;
            connect-src 'self' https://*.supabase.co https://*.stripe.com;
            frame-src https://*.stripe.com;
        `.replace(/\s+/g, ' ').trim()
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
            success_url: `${process.env.URL}/success?session_id={CHECKOUT_SESSION_ID}`,
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