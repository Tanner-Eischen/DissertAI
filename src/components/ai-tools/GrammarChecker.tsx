import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { checkSpelling, type GrammarError } from '@/lib/ai';
import { handleAsyncOperation, logError, ERROR_MESSAGES } from '@/lib/errorHandling';

interface Props {
  documentId: string;
  documentText: string;
  onErrorsChange?: (errors: GrammarError[]) => void;
  onApplyFix?: (start: number, end: number, correction: string) => void;
}

export function GrammarChecker({ documentId, documentText, onErrorsChange, onApplyFix }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<GrammarError[]>([]);
  const [error, setError] = useState<string>();
  const [retryCount, setRetryCount] = useState(0);

  const checkGrammar = async (isRetry = false) => {
    if (!documentText.trim()) {
      setErrors([]);
      onErrorsChange?.([]);
      setError(undefined);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    const { data, error: operationError } = await handleAsyncOperation(
      () => checkSpelling(documentText),
      {
        component: 'GrammarChecker',
        operation: 'checkSpelling',
        fallback: { errors: [] },
        onError: (error) => {
          setError(error.message || ERROR_MESSAGES.GRAMMAR_CHECK_FAILED);
          logError(error, {
            component: 'GrammarChecker',
            operation: 'checkSpelling',
            additionalInfo: { 
              documentId, 
              textLength: documentText.length,
              retryCount: isRetry ? retryCount + 1 : 0
            }
          });
        }
      }
    );

    if (data) {
      const newErrors = data.errors || [];
      setErrors(newErrors);
      onErrorsChange?.(newErrors);
      if (isRetry) {
        setRetryCount(0); // Reset retry count on success
      }
    } else if (operationError) {
      setErrors([]);
      onErrorsChange?.([]);
      if (isRetry) {
        setRetryCount(prev => prev + 1);
      }
    }

    setIsLoading(false);
  };

  const handleRetry = () => {
    checkGrammar(true);
  };

  useEffect(() => {
    let isMounted = true;
    let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

    const debouncedCheck = () => {
      if (!isMounted) return;
      checkGrammar();
    };

    debounceTimeout = setTimeout(debouncedCheck, 1000);
    
    return () => {
      isMounted = false;
      if (debounceTimeout) clearTimeout(debounceTimeout);
    };
  }, [documentId, documentText]);

  if (error) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Grammar & Spelling Check</h3>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <h5 className="text-sm font-medium text-red-800 mb-1">Grammar Check Failed</h5>
              <p className="text-sm text-red-700 mb-3">{error}</p>
              <button
                onClick={handleRetry}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-1" />
                )}
                Retry
              </button>
              {retryCount > 0 && (
                <p className="text-xs text-red-600 mt-2">
                  Retry attempts: {retryCount}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Grammar & Spelling Check</h3>
      {errors.length === 0 ? (
        <p className="text-green-600">No errors found</p>
      ) : (
        <ul className="space-y-3">
          {errors.map((error, index) => {
            const errorTypeColor = error.type === 'spelling' ? 'red' : error.type === 'grammar' ? 'yellow' : 'blue';
            const bgColor = error.type === 'spelling' ? 'bg-red-50' : error.type === 'grammar' ? 'bg-yellow-50' : 'bg-blue-50';
            const borderColor = error.type === 'spelling' ? 'border-red-100' : error.type === 'grammar' ? 'border-yellow-100' : 'border-blue-100';
            const textColor = error.type === 'spelling' ? 'text-red-600' : error.type === 'grammar' ? 'text-yellow-600' : 'text-blue-600';
            
            return (
              <li
                key={index}
                className={`p-3 ${bgColor} border ${borderColor} rounded-lg`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start">
                      <span className={`${textColor} font-medium`}>
                        {error.type.charAt(0).toUpperCase() + error.type.slice(1)}:
                      </span>
                      <p className="ml-2 text-gray-700">{error.message}</p>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Context: "{documentText.slice(Math.max(0, error.start - 10), error.start)}"
                      <span className={`${textColor} font-semibold`}>{documentText.slice(error.start, error.end)}</span>
                      "{documentText.slice(error.end, Math.min(documentText.length, error.end + 10))}"
                    </div>
                  </div>
                  {onApplyFix && (
                    <button
                      onClick={() => onApplyFix(error.start, error.end, error.correction)}
                      className={`ml-3 px-3 py-1 text-sm font-medium text-white rounded-md transition-colors ${
                        error.type === 'spelling' ? 'bg-red-500 hover:bg-red-600' : 
                        error.type === 'grammar' ? 'bg-yellow-500 hover:bg-yellow-600' : 
                        'bg-blue-500 hover:bg-blue-600'
                      }`}
                      title={`Apply fix: ${error.correction}`}
                    >
                      Fix
                    </button>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <strong>Suggestion:</strong> "{error.correction}"
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}