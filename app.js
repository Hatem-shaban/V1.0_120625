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

// Initialize and export
async function initializeStartupStack() {
    try {
        const aiTools = new StartupStackAI();
        
        const stack = {
            aiTools,
            supabase,
            initialized: true
        };

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