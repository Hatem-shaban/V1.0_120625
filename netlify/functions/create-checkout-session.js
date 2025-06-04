const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

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

        const { customerEmail, userId } = JSON.parse(event.body);

        if (!customerEmail || !userId) {
            throw new Error('Missing required fields');
        }

        // Verify user exists before updating
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            console.error('User verification error:', userError);
            throw new Error('User not found');
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [{
                price: process.env.STRIPE_PRICE_ID,
                quantity: 1,
            }],
            success_url: `${process.env.URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.URL}?checkout=cancelled`,
            customer_email: customerEmail,
            metadata: {
                userId: userId
            }
        });

        // Update user status with explicit single row update
        const { error: updateError } = await supabase
            .from('users')
            .update({ 
                subscription_status: 'pending_activation',
                stripe_session_id: session.id
            })
            .eq('id', userId)
            .select()
            .maybeSingle();

        if (updateError) {
            console.error('Error updating user status:', updateError);
            throw new Error('Failed to update user status');
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                id: session.id,
                userId: userId
            })
        };

    } catch (error) {
        console.error('Create checkout session error:', error);
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