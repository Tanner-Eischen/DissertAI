// Centralized error handling utilities for the application

export interface AppError {
  message: string;
  code?: string;
  stack?: string;
  timestamp: Date;
  component?: string;
  operation?: string;
}

export interface ApiErrorResponse {
  error: string;
  details?: string;
  code?: number;
}

// Type guard for error objects
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

// Type guard for API error responses
export function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  return typeof error === 'object' && error !== null && 'error' in error;
}

// Enhanced error logging with context
export function logError(error: unknown, context?: {
  component?: string;
  operation?: string;
  additionalInfo?: Record<string, any>;
}) {
  const timestamp = new Date().toISOString();
  const errorInfo: AppError = {
    message: isError(error) ? error.message : String(error),
    stack: isError(error) ? error.stack : undefined,
    timestamp: new Date(),
    component: context?.component,
    operation: context?.operation,
  };

  // Log to console with structured format
  console.error(`[${timestamp}] Error in ${context?.component || 'Unknown'}:`, {
    operation: context?.operation,
    message: errorInfo.message,
    stack: errorInfo.stack,
    additionalInfo: context?.additionalInfo,
  });

  // In production, you might want to send this to an error tracking service
  if ((import.meta as any).env?.PROD) {
    // TODO: Send to error tracking service (e.g., Sentry, LogRocket)
  }

  return errorInfo;
}

// Async operation wrapper with error handling
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  context: {
    component: string;
    operation: string;
    fallback?: T;
    onError?: (error: AppError) => void;
  }
): Promise<{ data?: T; error?: AppError }> {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    const appError = logError(error, context);
    
    if (context.onError) {
      context.onError(appError);
    }

    return { 
      error: appError,
      data: context.fallback 
    };
  }
}

// API error handler
export function handleApiError(error: unknown, operation: string): string {
  if (isApiErrorResponse(error)) {
    return error.details || error.error || 'API request failed';
  }
  
  if (isError(error)) {
    // Handle specific error types
    if (error.message.includes('fetch')) {
      return 'Network error. Please check your internet connection.';
    }
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      return 'Authentication failed. Please log in again.';
    }
    if (error.message.includes('403') || error.message.includes('forbidden')) {
      return 'You do not have permission to perform this action.';
    }
    if (error.message.includes('404') || error.message.includes('not found')) {
      return 'The requested resource was not found.';
    }
    if (error.message.includes('429') || error.message.includes('rate limit')) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    if (error.message.includes('500') || error.message.includes('server error')) {
      return 'Server error. Please try again later.';
    }
    
    return error.message;
  }
  
  return `Failed to ${operation}. Please try again.`;
}

// Retry mechanism for failed operations
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  context?: { component: string; operation: string }
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (context) {
        logError(error, {
          ...context,
          additionalInfo: { attempt, maxRetries }
        });
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError;
}

// User-friendly error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  AUTHENTICATION_ERROR: 'Your session has expired. Please log in again.',
  PERMISSION_ERROR: 'You do not have permission to perform this action.',
  NOT_FOUND_ERROR: 'The requested item could not be found.',
  RATE_LIMIT_ERROR: 'Too many requests. Please wait a moment and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  
  // AI service specific errors
  AI_SERVICE_UNAVAILABLE: 'AI service is currently unavailable. Please try again later.',
  AI_API_KEY_INVALID: 'AI service configuration error. Please contact support.',
  AI_QUOTA_EXCEEDED: 'AI service quota exceeded. Please try again later.',
  
  // Document service specific errors
  DOCUMENT_SAVE_FAILED: 'Failed to save document. Please try again.',
  DOCUMENT_LOAD_FAILED: 'Failed to load document. Please try again.',
  DOCUMENT_DELETE_FAILED: 'Failed to delete document. Please try again.',
  
  // Grammar checking specific errors
  GRAMMAR_CHECK_FAILED: 'Grammar check failed. Please try again.',
  GRAMMAR_SERVICE_UNAVAILABLE: 'Grammar checking service is currently unavailable.',
} as const;

// Error boundary helper
export class ErrorBoundaryError extends Error {
  constructor(
    message: string,
    public component: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ErrorBoundaryError';
  }
}