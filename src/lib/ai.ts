// AI service integration for various AI-powered tools
// ⚠️ Security Warning: OpenAI API key is exposed client-side. 
// For production, implement server-side proxy through Supabase Edge Functions.

import { handleAsyncOperation, handleApiError, logError, retryOperation, ERROR_MESSAGES } from './errorHandling';

// Base URL for Supabase Edge Functions
const SUPABASE_FUNCTIONS_URL = (import.meta as any).env.VITE_SUPABASE_FUNCTIONS_URL || 'https://rjkunveqbiltuhetakmm.supabase.co/functions/v1';

export const aiService = {
  async synthesizeAbstract(documentId: string, text: string) {
    return retryOperation(async () => {
      try {
        const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/abstract-synthesizer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId, text }),
        });
        
        if (!res.ok) {
          const errorText = await res.text().catch(() => 'Unknown error');
          throw new Error(`Abstract synthesis failed: ${res.status} ${res.statusText} - ${errorText}`);
        }
        
        const contentType = res.headers.get('Content-Type');
        if (contentType?.includes('application/json')) {
          return await res.json();
        } else {
          return await res.text(); // <-- handles Markdown or plain text
        }
      } catch (error) {
        logError(error, {
          component: 'aiService',
          operation: 'synthesizeAbstract',
          additionalInfo: { documentId, textLength: text.length }
        });
        throw new Error(handleApiError(error, 'synthesize abstract'));
      }
    }, 2, 1000, { component: 'aiService', operation: 'synthesizeAbstract' });
  },


  async generateArgumentMap(documentId: string, text: string) {
    return retryOperation(async () => {
      try {
        const apiKey = (import.meta as any).env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error(ERROR_MESSAGES.AI_API_KEY_INVALID);
        }

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{
              role: 'system',
              content: 'You are an expert at analyzing arguments and creating argument maps. Analyze the following text and create a well-formatted, structured analysis of the main arguments, supporting evidence, and logical connections. Use clear headings, bullet points, and organize the content for easy reading.'
            }, {
              role: 'user',
              content: text
            }]
          })
        });

        if (!res.ok) {
          const errorData = await res.text().catch(() => 'Unknown error');
          
          // Handle specific OpenAI API errors
          if (res.status === 401) {
            throw new Error(ERROR_MESSAGES.AI_API_KEY_INVALID);
          } else if (res.status === 429) {
            throw new Error(ERROR_MESSAGES.AI_QUOTA_EXCEEDED);
          } else if (res.status >= 500) {
            throw new Error(ERROR_MESSAGES.SERVER_ERROR);
          }
          
          throw new Error(`OpenAI API error: ${res.status} ${res.statusText} - ${errorData}`);
        }

        const data = await res.json();
        
        // Validate response structure
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error('Invalid response format from OpenAI API');
        }
        
        const content = data.choices[0].message.content;
        if (!content) {
          throw new Error('Empty response from OpenAI API');
        }
        
        return content;
      } catch (error) {
        logError(error, {
          component: 'aiService',
          operation: 'generateArgumentMap',
          additionalInfo: { documentId, textLength: text.length }
        });
        throw new Error(handleApiError(error, 'generate argument map'));
      }
    }, 2, 1000, { component: 'aiService', operation: 'generateArgumentMap' });
  },


  async suggestCitations(documentId: string, text: string) {
    return retryOperation(async () => {
      try {
        const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/citation-annotator`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId, text }),
        });
        
        if (!res.ok) {
          const errorText = await res.text().catch(() => 'Unknown error');
          throw new Error(`Citation annotation failed: ${res.status} ${res.statusText} - ${errorText}`);
        }
        
        const contentType = res.headers.get('Content-Type');
        if (contentType?.includes('application/json')) {
          return await res.json();
        } else {
          return await res.text(); // <-- handles Markdown or plain text
        }
      } catch (error) {
        logError(error, {
          component: 'aiService',
          operation: 'suggestCitations',
          additionalInfo: { documentId, textLength: text.length }
        });
        throw new Error(handleApiError(error, 'suggest citations'));
      }
    }, 2, 1000, { component: 'aiService', operation: 'suggestCitations' });
  },



  async runVirtualReview(documentId: string, text: string) {
    return retryOperation(async () => {
      try {
        const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/virtual-reviewer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId, text }),
        });
        
        if (!res.ok) {
          const errorText = await res.text().catch(() => 'Unknown error');
          throw new Error(`Virtual review failed: ${res.status} ${res.statusText} - ${errorText}`);
        }

        const contentType = res.headers.get('Content-Type');
        if (contentType?.includes('application/json')) {
          return await res.json();
        } else {
          return await res.text(); // <-- handles Markdown or plain text
        }
      } catch (error) {
        logError(error, {
          component: 'aiService',
          operation: 'runVirtualReview',
          additionalInfo: { documentId, textLength: text.length }
        });
        throw new Error(handleApiError(error, 'run virtual review'));
      }
    }, 2, 1000, { component: 'aiService', operation: 'runVirtualReview' });
  },

  async generateAbstract(documentId: string, text: string) {
    return retryOperation(async () => {
      try {
        const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/abstract-synthesizer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId, text }),
        });
        
        if (!res.ok) {
          const errorText = await res.text().catch(() => 'Unknown error');
          throw new Error(`Abstract generation failed: ${res.status} ${res.statusText} - ${errorText}`);
        }
        
        const contentType = res.headers.get('Content-Type');
        if (contentType?.includes('application/json')) {
          return await res.json();
        } else {
          return await res.text(); // <-- handles Markdown or plain text
        }
      } catch (error) {
        logError(error, {
          component: 'aiService',
          operation: 'generateAbstract',
          additionalInfo: { documentId, textLength: text.length }
        });
        throw new Error(handleApiError(error, 'generate abstract'));
      }
    }, 2, 1000, { component: 'aiService', operation: 'generateAbstract' });
  },



};
// Re-export Sapling service for backward compatibility (keeping Harper names)
export { checkSpelling, saplingService } from './sapling';
export type { SaplingError as GrammarError } from './sapling';
// Legacy exports for backward compatibility
export { harperService } from './sapling';
export type { HarperError } from './sapling';

