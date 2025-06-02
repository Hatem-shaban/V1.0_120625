// Supabase client setup
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js'

const supabaseUrl = 'https://ygnrdquwnafkbkxirtae.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnbnJkcXV3bmFma2JreGlydGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNTY3MjMsImV4cCI6MjA2MzczMjcyM30.R1QNPExVxHJ8wQjvkuOxfPH0Gf1KR4HOafaP3flPWaI'
const supabase = createClient(supabaseUrl, supabaseKey)

// AI Tool Functions
class StartupStackAI {
    constructor() {
        this.openaiKey = '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';
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
    }
}

// User Management
class UserManager {
    async signUp(email) {
        try {
            // Check if user exists
            const { data: existingUser } = await supabase
                .from('users')
                .select('id, email')
                .eq('email', email)
                .single();

            if (existingUser) {
                return existingUser;
            }

            // Create user
            const { data: userData, error: userError } = await supabase
                .from('users')
                .insert([{
                    email: email,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (userError) throw userError;

            return userData;
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