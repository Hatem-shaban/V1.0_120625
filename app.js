// Supabase client setup
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = 'https://ygnrdquwnafkbkxirtae.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnbnJkcXV3bmFma2JreGlydGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNTY3MjMsImV4cCI6MjA2MzczMjcyM30.R1QNPExVxHJ8wQjvkuOxfPH0Gf1KR4HOafaP3flPWaI'
const supabase = createClient(supabaseUrl, supabaseKey)

// AI Tool Functions
class StartupStackAI {
    constructor() {
        this.openaiKey = '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';
    }

    async callOpenAI(prompt) {
        try {
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

            if (!response.ok) throw new Error('OpenAI API error');
            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('OpenAI API error:', error);
            throw error;
        }
    }

    // Business Name Generator
    async generateBusinessNames(industry, keywords) {
        const prompt = `Generate 10 creative, brandable business names for a ${industry} company. Keywords: ${keywords}. Format as JSON array.`;
        return this.callOpenAI(prompt);
    }

    // Logo Creator
    async generateLogo(style, industry) {
        const prompt = `Design a logo concept for a ${industry} company. Style: ${style}. Describe the design elements, colors, and typography in detail.`;
        return this.callOpenAI(prompt);
    }

    // Pitch Deck Generator
    async generatePitchDeck(type, industry) {
        const prompt = `Create an outline for a ${type} pitch deck in the ${industry} industry. Include key sections and content recommendations.`;
        return this.callOpenAI(prompt);
    }

    // Market Research
    async analyzeMarket(industry, region) {
        const prompt = `Analyze the ${industry} market in ${region}. Include market size, key competitors, trends, and opportunities.`;
        return this.callOpenAI(prompt);
    }

    // Content Calendar
    async generateContentCalendar(business, audience) {
        const prompt = `Create a 30-day social media content calendar for a ${business} targeting ${audience}. Include post types, topics, and hashtags.`;
        return this.callOpenAI(prompt);
    }

    // Email Templates
    async generateEmailTemplates(business, sequence) {
        const prompt = `Generate email templates for a ${sequence} sequence for a ${business}. Include subject lines and body copy.`;
        return this.callOpenAI(prompt);
    }

    // Legal Documents
    async generateLegalDocs(business, docType) {
        const prompt = `Create a ${docType} template for a ${business}. Include standard clauses and customization points.`;
        return this.callOpenAI(prompt);
    }

    // Financial Projections
    async generateFinancials(business, timeframe) {
        const prompt = `Generate ${timeframe} financial projections template for a ${business}. Include revenue streams, costs, and growth assumptions.`;
        return this.callOpenAI(prompt);
    }
}

// User Management
class UserManager {
    async signUp(email) {
        try {
            // Check if user exists
            const { data: existingUser, error: selectError } = await supabase
                .from('users')
                .select('id, email')
                .eq('email', email)
                .single();

            if (selectError && selectError.code !== 'PGRST116') {
                console.error('Error checking existing user:', selectError);
                throw selectError;
            }

            if (existingUser) {
                return existingUser;
            }

            // Insert new user
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert([{
                    email: email,
                    created_at: new Date().toISOString(),
                    subscription_status: 'pending'
                }])
                .select()
                .single();

            if (insertError) {
                console.error('Error creating user:', insertError);
                throw insertError;
            }

            return newUser;
        } catch (error) {
            console.error('Error in signUp:', error);
            throw error;
        }
    }
}

// Initialize and export
async function initializeStartupStack() {
    try {
        // Create instances
        const aiTools = new StartupStackAI();
        const userManager = new UserManager();

        // Create the stack object
        const stack = {
            aiTools,
            userManager,
            supabase,
            initialized: true
        };

        // Make it globally available
        window.StartupStack = stack;

        console.log('StartupStack initialized successfully');
        return stack;
    } catch (error) {
        console.error('Error initializing StartupStack:', error);
        throw error;
    }
}

// Export the initialization function
export default initializeStartupStack();