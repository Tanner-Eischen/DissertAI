import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { checkSpelling, type GrammarError } from '@/lib/ai';

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

  useEffect(() => {
    let isMounted = true;
    let debounceTimeout: NodeJS.Timeout | null = null;

    const checkGrammar = async () => {
      if (!documentText.trim()) {
        if (isMounted) {
          setErrors([]);
          onErrorsChange?.([]);
        }
        return;
      }

      try {
        if (!isMounted) return;

        setIsLoading(true);
        setError(undefined);

        const result = await checkSpelling(documentText);
        
        if (!isMounted) return;

        const newErrors = result.errors || [];
        setErrors(newErrors);
        onErrorsChange?.(newErrors);
      } catch (err) {
        if (!isMounted) return;

        const errorMessage = err instanceof Error ? err.message : 'Failed to check grammar';
        console.error('Grammar check error:', errorMessage);
        setError(errorMessage);
        setErrors([]);
        onErrorsChange?.([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    debounceTimeout = setTimeout(checkGrammar, 1000);
    
    return () => {
      isMounted = false;
      if (debounceTimeout) clearTimeout(debounceTimeout);
    };
  }, [documentId, documentText]);

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>{error}</p>
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