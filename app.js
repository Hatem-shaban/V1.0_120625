// Supabase client setup
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = 'https://ygnrdquwnafkbkxirtae.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlnbnJkcXV3bmFma2JreGlydGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNTY3MjMsImV4cCI6MjA2MzczMjcyM30.R1QNPExVxHJ8wQjvkuOxfPH0Gf1KR4HOafaP3flPWaI'
const supabase = createClient(supabaseUrl, supabaseKey)

// AI Tool Functions
class StartupStackAI {
    async callAIOperation(operation, params) {
        try {
            const response = await fetch('/.netlify/functions/ai-operations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    operation,
                    params
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.error) throw new Error(data.error);
            return data;
        } catch (error) {
            console.error('AI operation error:', error);
            throw error;
        }
    }

    // Update all AI tool methods to use callAIOperation
    async generateBusinessNames(industry, keywords) {
        return this.callAIOperation('generateBusinessNames', { industry, keywords });
    }

    async generateLogo(style, industry) {
        return this.callAIOperation('generateLogo', { style, industry });
    }

    async generatePitchDeck(type, industry) {
        return this.callAIOperation('generatePitchDeck', { type, industry });
    }

    async analyzeMarket(industry, region) {
        return this.callAIOperation('analyzeMarket', { industry, region });
    }

    async generateContentCalendar(business, audience) {
        return this.callAIOperation('generateContentCalendar', { business, audience });
    }

    async generateEmailTemplates(business, sequence) {
        return this.callAIOperation('generateEmailTemplates', { business, sequence });
    }

    async generateLegalDocs(business, docType) {
        return this.callAIOperation('generateLegalDocs', { business, docType });
    }

    async generateFinancials(business, timeframe) {
        return this.callAIOperation('generateFinancials', { business, timeframe });
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

// Export the initialization promise
export default initializeStartupStack();