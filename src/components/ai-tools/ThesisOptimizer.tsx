import { useState } from 'react';
import { Target, Loader2, Zap, AlertCircle } from 'lucide-react';
import { aiService } from '@/lib/ai';
import { ResponseDisplay } from './ResponseDisplay';
import { handleAsyncOperation, logError, ERROR_MESSAGES } from '@/lib/errorHandling';

interface Props {
  documentId: string;
  documentText: string;
}

export function ThesisOptimizer({ documentId, documentText }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    if (!documentText.trim()) {
      setResult('Please add some content to your document first.');
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const { data, error: operationError } = await handleAsyncOperation(
      () => aiService.synthesizeAbstract(documentId, documentText),
      {
        component: 'ThesisOptimizer',
        operation: 'synthesizeAbstract',
        onError: (error) => {
          setError(error.message);
          logError(error, {
            component: 'ThesisOptimizer',
            operation: 'synthesizeAbstract',
            additionalInfo: { documentId, textLength: documentText.length }
          });
        }
      }
    );

    if (data) {
      setResult(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    } else if (operationError) {
      setError(operationError.message || ERROR_MESSAGES.AI_SERVICE_UNAVAILABLE);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-orange-100 rounded-lg">
          <Target className="w-6 h-6 text-orange-600" />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Thesis Optimizer</h4>
          <p className="text-gray-600 mb-4">
            Analyze and strengthen your thesis statement to make it more compelling, clear, and academically rigorous.
          </p>
          <button 
            onClick={handleRun} 
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Optimizing Thesis...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Optimize Thesis
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h5 className="text-sm font-medium text-red-800 mb-1">Error</h5>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {(result || loading) && (
        <ResponseDisplay
          title="Thesis Optimization"
          content={result || ''}
          isLoading={loading}
        />
      )}
    </div>
  );
}