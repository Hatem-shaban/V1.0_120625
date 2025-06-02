// Supabase client setup
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js'

const supabaseUrl = 'https://ygnrdquwnafkbkxirtae.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnbnJkcXV3bmFma2JreGlydGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNTY3MjMsImV4cCI6MjA2MzczMjcyM30.R1QNPExVxHJ8wQjvkuOxfPH0Gf1KR4HOafaP3flPWaI'
const supabase = createClient(supabaseUrl, supabaseKey)

// Initialize anonymous session
await supabase.auth.signInAnonymously()
    .then(({ data, error }) => {
        if (error) {
            console.error('Auth error:', error);
            throw error;
        }
        console.log('Anonymous session created:', data);
    });

// AI Tool Functions
class StartupStackAI {
    constructor() {
        this.openaiKey = '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'; // Use environment variable in production
    }

    // Business Name Generator
    async generateBusinessNames(industry, keywords) {
        const prompt = `Generate 10 creative, brandable business names for a ${industry} company. Keywords: ${keywords}. Format as JSON array.`;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.openaiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 500
            })
        });
        
        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    }

    // Content Calendar Generator
    async generateContentCalendar(businessType, audience) {
        const prompt = `Create a 30-day social media content calendar for a ${businessType} targeting ${audience}. Include post ideas, hashtags, and optimal posting times. Format as JSON.`;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.openaiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 1500
            })
        });
        
        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    }

    // Email Template Generator
    async generateEmailTemplates(purpose, industry) {
        const prompt = `Generate 5 email templates for ${purpose} in the ${industry} industry. Include subject lines and call-to-actions. Format as JSON.`;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.openaiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 1000
            })
        });
        
        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    }

    // Market Research Tool
    async analyzeMarket(industry, location) {
        const prompt = `Analyze the ${industry} market in ${location}. Provide: market size, key competitors, opportunities, threats, and target demographics. Format as structured JSON.`;
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.openaiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 1500
            })
        });
        
        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    }
}

// User Management
class UserManager {
    async signUp(email, referralCode = null) {
        try {
            // First check if user exists
            const { data: existingUser } = await supabase
                .from('users')
                .select('id, email')
                .eq('email', email)
                .single();

            if (existingUser) {
                console.log('User already exists:', existingUser);
                return existingUser;
            }

            // Create new user with error handling
            const { data, error } = await supabase
                .from('users')
                .insert([{
                    email: email,
                    referred_by: referralCode ? await this.getUserByReferralCode(referralCode) : null,
                    created_at: new Date().toISOString(),
                    subscription_status: 'active'
                }])
                .select()
                .single();

            if (error) {
                console.error('Supabase insert error:', error);
                // Try to provide more specific error messages
                if (error.code === '42501') {
                    throw new Error('Permission denied. Please check your authentication.');
                }
                throw error;
            }

            if (!data) {
                throw new Error('No data returned from insert operation');
            }

            console.log('User created successfully:', data);
            return data;

        } catch (error) {
            console.error('Error in signUp:', error);
            throw error;
        }
    }

    async getUserByReferralCode(code) {
        const { data } = await supabase
            .from('users')
            .select('id')
            .eq('referral_code', code)
            .single();
        
        return data?.id || null;
    }

    async trackToolUsage(userId, toolName, inputData, outputData) {
        try {
            const { error } = await supabase
                .from('tool_usage')
                .insert([{
                    user_id: userId,
                    tool_name: toolName,
                    input_data: inputData,
                    output_data: outputData
                }]);

            if (error) {
                console.error('Error tracking tool usage:', error);
                throw error;
            }
        } catch (error) {
            console.error('Failed to track tool usage:', error);
            throw error;
        }
    }
}

// Initialize and export
async function initializeStartupStack() {
    try {
        // Initialize anonymous session first
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
        if (authError) throw authError;
        
        // Create instances
        const aiTools = new StartupStackAI();
        const userManager = new UserManager();

        // Export for use in HTML
        window.StartupStack = {
            aiTools,
            userManager,
            supabase
        };

        console.log('StartupStack initialized');
    } catch (error) {
        console.error('Error initializing StartupStack:', error);
    }
}

// Call the initialize function
initializeStartupStack();

// Export the initialized instance
const stack = {
    aiTools: new StartupStackAI(),
    userManager: new UserManager(),
    supabase
};

export default stack;