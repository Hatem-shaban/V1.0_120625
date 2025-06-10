const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { email, userName } = JSON.parse(event.body);

        const msg = {
            to: email,
            from: 'welcome@startupstack.ai', // Verify this domain in SendGrid
            subject: 'Welcome to StartupStack - Your AI Toolkit Awaits!',
            text: `Welcome to StartupStack!`,
            html: `
                <h1>🎉 Welcome to StartupStack!</h1>
                <p>Your AI-powered entrepreneur toolkit is ready to use:</p>
                <ul>
                    <li>✅ Business Name Generator</li>
                    <li>✅ Logo Creator</li>
                    <li>✅ Pitch Deck Templates</li>
                    <li>✅ Market Research Tool</li>
                    <li>✅ Content Calendar</li>
                    <li>✅ Email Templates</li>
                    <li>✅ Legal Documents</li>
                    <li>✅ Financial Projections</li>
                </ul>
                <p><a href="${process.env.URL}/dashboard">Login to your dashboard</a></p>
                <p>Questions? Just reply to this email.</p>
                <p>Let's build something amazing!</p>
                <p>- The StartupStack Team</p>
            `
        };

        await sgMail.send(msg);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Welcome email sent successfully' })
        };
    } catch (error) {
        console.error('Email sending failed:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to send welcome email' })
        };
    }
};