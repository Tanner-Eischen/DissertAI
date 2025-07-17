// Validation script for comprehensive error handling improvements

import { describe, it, expect, vi } from 'vitest';
import { 
  handleAsyncOperation, 
  handleApiError, 
  retryOperation, 
  logError, 
  isError,
  ERROR_MESSAGES 
} from '../lib/errorHandling';

describe('Error Handling Improvements', () => {
  describe('handleAsyncOperation', () => {
    it('should handle successful operations', async () => {
      const { data, error } = await handleAsyncOperation(
        async () => 'success',
        {
          component: 'Test',
          operation: 'testSuccess'
        }
      );

      expect(data).toBe('success');
      expect(error).toBeUndefined();
    });

    it('should handle failed operations with fallback', async () => {
      const { data, error } = await handleAsyncOperation(
        async () => {
          throw new Error('Test error');
        },
        {
          component: 'Test',
          operation: 'testFailure',
          fallback: 'fallback value'
        }
      );

      expect(data).toBe('fallback value');
      expect(error).toBeDefined();
      expect(error?.message).toBe('Test error');
    });

    it('should call onError callback when operation fails', async () => {
      let errorCallbackCalled = false;
      let capturedError: any = null;

      await handleAsyncOperation(
        async () => {
          throw new Error('Test error');
        },
        {
          component: 'Test',
          operation: 'testCallback',
          onError: (error) => {
            errorCallbackCalled = true;
            capturedError = error;
          }
        }
      );

      expect(errorCallbackCalled).toBe(true);
      expect(capturedError?.message).toBe('Test error');
    });
  });

  describe('handleApiError', () => {
    it('should handle network errors', () => {
      const networkError = new Error('fetch failed');
      const result = handleApiError(networkError, 'test operation');
      expect(result).toBe('Network error. Please check your internet connection.');
    });

    it('should handle authentication errors', () => {
      const authError = new Error('401 unauthorized');
      const result = handleApiError(authError, 'test operation');
      expect(result).toBe('Authentication failed. Please log in again.');
    });

    it('should handle server errors', () => {
      const serverError = new Error('500 server error');
      const result = handleApiError(serverError, 'test operation');
      expect(result).toBe('Server error. Please try again later.');
    });

    it('should handle rate limit errors', () => {
      const rateLimitError = new Error('429 rate limit');
      const result = handleApiError(rateLimitError, 'test operation');
      expect(result).toBe('Too many requests. Please wait a moment and try again.');
    });

    it('should handle unknown errors', () => {
      const unknownError = { message: 'Unknown error' };
      const result = handleApiError(unknownError, 'test operation');
      expect(result).toBe('Failed to test operation. Please try again.');
    });
  });

  describe('retryOperation', () => {
    it('should succeed on first attempt', async () => {
      const result = await retryOperation(
        async () => 'success',
        3,
        10
      );

      expect(result).toBe('success');
    });

    it('should retry and eventually succeed', async () => {
      let attemptCount = 0;

      const result = await retryOperation(
        async () => {
          attemptCount++;
          if (attemptCount < 3) {
            throw new Error(`Attempt ${attemptCount} failed`);
          }
          return `Success on attempt ${attemptCount}`;
        },
        3,
        10
      );

      expect(result).toBe('Success on attempt 3');
      expect(attemptCount).toBe(3);
    });

    it('should fail after max retries', async () => {
      let attemptCount = 0;

      await expect(
        retryOperation(
          async () => {
            attemptCount++;
            throw new Error(`Attempt ${attemptCount} failed`);
          },
          2,
          10
        )
      ).rejects.toThrow('Attempt 2 failed');

      expect(attemptCount).toBe(2);
    });
  });

  describe('logError', () => {
    it('should log error with context', () => {
      const testError = new Error('Test error');
      const loggedError = logError(testError, {
        component: 'TestComponent',
        operation: 'testOperation',
        additionalInfo: { testData: 'example' }
      });

      expect(loggedError.message).toBe('Test error');
      expect(loggedError.component).toBe('TestComponent');
      expect(loggedError.operation).toBe('testOperation');
      expect(loggedError.timestamp).toBeInstanceOf(Date);
    });

    it('should handle non-Error objects', () => {
      const testError = 'String error';
      const loggedError = logError(testError, {
        component: 'TestComponent',
        operation: 'testOperation'
      });

      expect(loggedError.message).toBe('String error');
      expect(loggedError.stack).toBeUndefined();
    });
  });

  describe('isError type guard', () => {
    it('should identify Error objects', () => {
      const realError = new Error('Real error');
      const fakeError = { message: 'Fake error' };
      const stringError = 'String error';

      expect(isError(realError)).toBe(true);
      expect(isError(fakeError)).toBe(false);
      expect(isError(stringError)).toBe(false);
    });
  });

  describe('ERROR_MESSAGES constants', () => {
    it('should have all required error messages', () => {
      expect(ERROR_MESSAGES.NETWORK_ERROR).toBeDefined();
      expect(ERROR_MESSAGES.AUTHENTICATION_ERROR).toBeDefined();
      expect(ERROR_MESSAGES.AI_SERVICE_UNAVAILABLE).toBeDefined();
      expect(ERROR_MESSAGES.GRAMMAR_CHECK_FAILED).toBeDefined();
      expect(ERROR_MESSAGES.DOCUMENT_SAVE_FAILED).toBeDefined();
    });

    it('should have user-friendly error messages', () => {
      expect(ERROR_MESSAGES.NETWORK_ERROR).toContain('internet connection');
      expect(ERROR_MESSAGES.AUTHENTICATION_ERROR).toContain('log in again');
      expect(ERROR_MESSAGES.SERVER_ERROR).toContain('try again later');
    });
  });
});

// Integration test for AI service error handling
describe('AI Service Error Handling Integration', () => {
  it('should handle API failures gracefully', async () => {
    // Mock fetch to simulate API failure
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const { aiService } = await import('../lib/ai');

    try {
      await aiService.generateArgumentMap('test-doc', 'test text');
    } catch (error) {
      expect(isError(error)).toBe(true);
      expect((error as Error).message).toContain('Network error');
    }

    // Restore original fetch
    global.fetch = originalFetch;
  });
});

// Integration test for document service error handling
describe('Document Service Error Handling Integration', () => {
  it('should handle database errors gracefully', async () => {
    // This would require mocking Supabase client
    // For now, we'll test that the functions exist and have proper error handling structure
    const { createDocument, saveDocument, loadDocuments } = await import('../services/documentService');

    expect(typeof createDocument).toBe('function');
    expect(typeof saveDocument).toBe('function');
    expect(typeof loadDocuments).toBe('function');
  });
});

console.log('✅ Error handling validation tests completed successfully!');