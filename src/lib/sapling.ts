// Sapling Edits API integration for grammar checking

import { handleAsyncOperation, handleApiError, logError, retryOperation, ERROR_MESSAGES } from './errorHandling';

export interface SaplingError {
  start: number;
  end: number;
  message: string;
  type: 'grammar' | 'spelling' | 'punctuation';
  incorrect: string;
  correction: string;
}

// Legacy alias for backward compatibility
export type HarperError = SaplingError;

interface SaplingEdit {
  id: string;
  sentence_start: number;
  sentence_end: number;
  start: number;
  end: number;
  replacement: string;
  error_type: string;
  general_error_type: string;
}

interface SaplingResponse {
  edits: SaplingEdit[];
}

class SaplingService {
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly apiUrl = 'https://api.sapling.ai/api/v1/edits';
  private isInitialized = false;

  constructor() {
    // Load API keys from environment variables
    this.publicKey = (import.meta as any).env.VITE_SAPLING_PUBLIC_KEY || '';
    this.privateKey = (import.meta as any).env.VITE_SAPLING_PRIVATE_KEY || '';
    
    if (!this.privateKey) {
      console.warn('⚠️ Sapling private key not found in environment variables. Grammar checking will be disabled.');
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    const { error } = await handleAsyncOperation(
      () => this.testConnection(),
      {
        component: 'SaplingService',
        operation: 'initialize',
        onError: (error) => {
          console.error('Failed to initialize Sapling:', error.message);
          this.isInitialized = false;
        }
      }
    );

    if (!error) {
      this.isInitialized = true;
      console.log('Sapling grammar checker initialized successfully');
    }
  }

  private async testConnection(): Promise<void> {
    const testText = 'This is a test.';
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: this.privateKey,
        text: testText,
        session_id: 'test-session'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sapling API test error response:', errorText);
      throw new Error(`Sapling API test failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
  }

  async checkText(text: string): Promise<SaplingError[]> {
    await this.initialize();
    
    if (!this.isInitialized) {
      console.warn('Sapling service not available, returning empty results');
      return [];
    }

    if (!text || text.trim().length === 0) {
      console.log('Empty text provided, returning empty results');
      return [];
    }

    const { data, error } = await handleAsyncOperation(
      () => retryOperation(async () => {
        console.log('Checking text with Sapling:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
        
        const response = await fetch(this.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: this.privateKey,
            text: text,
            session_id: `session-${Date.now()}`
          })
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          
          // Handle specific API errors
          if (response.status === 401) {
            throw new Error(ERROR_MESSAGES.AI_API_KEY_INVALID);
          } else if (response.status === 429) {
            throw new Error(ERROR_MESSAGES.AI_QUOTA_EXCEEDED);
          } else if (response.status >= 500) {
            throw new Error(ERROR_MESSAGES.SERVER_ERROR);
          }
          
          throw new Error(`Sapling API request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data: SaplingResponse = await response.json();
        
        // Validate response structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format from Sapling API');
        }
        
        console.log('Sapling API response:', data);
        
        // Log individual edits for debugging
        if (data.edits && data.edits.length > 0) {
          console.log('Raw edits from Sapling:');
          data.edits.forEach((edit, index) => {
            console.log(`Edit ${index + 1}:`, {
              error_type: edit.error_type,
              general_error_type: edit.general_error_type,
              start: edit.start,
              end: edit.end,
              sentence_start: edit.sentence_start,
              replacement: edit.replacement,
              text: text.slice(edit.sentence_start, edit.sentence_end)
            });
          });
        }
        
        const errors = this.convertEditsToErrors(data.edits || [], text);
        console.log('Converted errors:', errors);
        return errors;
      }, 2, 1000, { component: 'SaplingService', operation: 'checkText' }),
      {
        component: 'SaplingService',
        operation: 'checkText',
        fallback: [],
        onError: (error) => {
          logError(error, {
            component: 'SaplingService',
            operation: 'checkText',
            additionalInfo: { textLength: text.length }
          });
        }
      }
    );

    return data || [];
  }

  isAvailable(): boolean {
    return this.isInitialized;
  }

  private convertEditsToErrors(edits: SaplingEdit[], text: string): SaplingError[] {
    return edits.map(edit => {
      // Handle different position calculation strategies based on available data
      let absoluteStart: number;
      let absoluteEnd: number;
      
      // If sentence_start is provided, use it as base offset
      if (typeof edit.sentence_start === 'number' && edit.sentence_start >= 0) {
        absoluteStart = edit.sentence_start + edit.start;
        absoluteEnd = edit.sentence_start + edit.end;
      } else {
        // Fallback: assume start/end are already absolute positions
        absoluteStart = edit.start;
        absoluteEnd = edit.end;
      }
      
      // Ensure positions are within text bounds and logical
      const validStart = Math.max(0, Math.min(absoluteStart, text.length));
      const validEnd = Math.max(validStart, Math.min(absoluteEnd, text.length));
      
      // Additional validation: ensure we have a valid range
      const finalStart = validStart;
      const finalEnd = validEnd > validStart ? validEnd : validStart + 1;
      
      // Extract the actual text for validation
      const extractedText = text.slice(finalStart, finalEnd);
      
      // Debug logging for position validation
      if ((import.meta as any).env === 'development') {
        console.debug('Position calculation:', {
          sentence_start: edit.sentence_start,
          edit_start: edit.start,
          edit_end: edit.end,
          calculated_start: absoluteStart,
          calculated_end: absoluteEnd,
          final_start: finalStart,
          final_end: finalEnd,
          extracted_text: extractedText,
          replacement: edit.replacement
        });
      }
      
      return {
        start: finalStart,
        end: finalEnd,
        message: this.generateErrorMessage(edit),
        type: this.classifyErrorType(edit),
        incorrect: extractedText,
        correction: edit.replacement || ''
      };
    });
  }

  private generateErrorMessage(edit: SaplingEdit): string {
    const generalType = edit.general_error_type || '';
    const specificType = edit.error_type || '';
    const replacement = edit.replacement;
    
    // Create more descriptive messages based on error types
    if (replacement) {
      if (generalType.toLowerCase().includes('spelling')) {
        return `Spelling: "${replacement}" may be the correct spelling`;
      }
      if (generalType.toLowerCase().includes('grammar')) {
        return `Grammar: Consider changing to "${replacement}"`;
      }
      if (generalType.toLowerCase().includes('punctuation')) {
        return `Punctuation: Consider using "${replacement}"`;
      }
      // Fallback with general type
      return `${generalType || specificType}: Consider changing to "${replacement}"`;
    }
    
    // Messages without replacements
    return `${generalType || specificType || 'Issue'} detected`;
  }

  private classifyErrorType(edit: SaplingEdit): 'grammar' | 'spelling' | 'punctuation' {
    const generalType = (edit.general_error_type || '').toLowerCase();
    const specificType = (edit.error_type || '').toLowerCase();
    
    // Check general type first (more reliable)
    if (generalType.includes('spelling')) {
      return 'spelling';
    }
    if (generalType.includes('punctuation')) {
      return 'punctuation';
    }
    if (generalType.includes('grammar')) {
      return 'grammar';
    }
    
    // Fallback to specific type analysis
    const errorType = generalType || specificType;
    
    // Spelling-related errors
    if (errorType.includes('spell') || errorType.includes('misspell') || 
        errorType.includes('typo') || errorType.includes('word_choice')) {
      return 'spelling';
    }
    
    // Punctuation-related errors
    if (errorType.includes('punct') || errorType.includes('comma') || 
        errorType.includes('period') || errorType.includes('apostrophe') ||
        errorType.includes('quotation') || errorType.includes('colon') ||
        errorType.includes('semicolon')) {
      return 'punctuation';
    }
    
    // Grammar-related errors (most comprehensive)
    if (errorType.includes('grammar') || errorType.includes('syntax') || 
        errorType.includes('agreement') || errorType.includes('tense') ||
        errorType.includes('capitalization') || errorType.includes('spacing') ||
        errorType.includes('word_order') || errorType.includes('article') ||
        errorType.includes('preposition') || errorType.includes('verb') ||
        errorType.includes('noun') || errorType.includes('adjective')) {
      return 'grammar';
    }
    
    // Default to grammar for unknown types
    return 'grammar';
  }
}

// Export a singleton instance (keeping the old name for compatibility)
export const saplingService = new SaplingService();
export const harperService = saplingService; // Legacy alias for backward compatibility

// Legacy export for backward compatibility
export async function checkSpelling(text: string): Promise<{ errors: SaplingError[] }> {
  if (!text.trim()) {
    return { errors: [] };
  }
  
  try {
    const errors = await saplingService.checkText(text);
    return { errors };
  } catch (error) {
    console.error('Sapling text checking failed:', error);
    return { errors: [] };
  }
}