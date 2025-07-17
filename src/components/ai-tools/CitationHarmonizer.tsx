import { useState } from 'react';
import { Quote, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import { aiService } from '@/lib/ai';
import { ResponseDisplay } from './ResponseDisplay';
import { handleAsyncOperation, logError, ERROR_MESSAGES } from '@/lib/errorHandling';

type Props = {
  documentId: string;
  documentText: string;
};

// Helper function to convert JSON object to formatted text
const formatJsonToText = (obj: any): string => {
  const formatValue = (value: any, depth: number = 0): string => {
    const indent = '  '.repeat(depth);
    
    if (typeof value === 'string') {
      return value;
    }
    
    if (Array.isArray(value)) {
      return value.map(item => {
        if (typeof item === 'string') {
          return `• ${item}`;
        } else if (typeof item === 'object' && item !== null) {
          return formatValue(item, depth + 1);
        }
        return `• ${String(item)}`;
      }).join('\n');
    }
    
    if (typeof value === 'object' && value !== null) {
      return Object.entries(value).map(([key, val]) => {
        const formattedKey = key.replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .replace(/\s+/g, ' ')
          .trim();
        
        if (Array.isArray(val)) {
          return `## ${formattedKey}\n\n${formatValue(val, depth + 1)}`;
        } else if (typeof val === 'object' && val !== null) {
          return `## ${formattedKey}\n\n${formatValue(val, depth + 1)}`;
        } else {
          return `**${formattedKey}:** ${String(val)}`;
        }
      }).join('\n\n');
    }
    
    return String(value);
  };
  
  return formatValue(obj);
};

export function CitationHarmonizer({ documentId, documentText }: Props) {
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
      () => aiService.suggestCitations(documentId, documentText),
      {
        component: 'CitationHarmonizer',
        operation: 'suggestCitations',
        onError: (error) => {
          setError(error.message);
          logError(error, {
            component: 'CitationHarmonizer',
            operation: 'suggestCitations',
            additionalInfo: { documentId, textLength: documentText.length }
          });
        }
      }
    );

    if (data) {
      // Format the response to remove JSON formatting and create clean text
      let formattedResult: string;
      
      if (typeof data === 'string') {
        formattedResult = data;
      } else if (typeof data === 'object' && data !== null) {
        // Convert JSON object to formatted text with headings and bullet points
        formattedResult = formatJsonToText(data);
      } else {
        formattedResult = String(data);
      }
      
      setResult(formattedResult);
    } else if (operationError) {
      setError(operationError.message || ERROR_MESSAGES.AI_SERVICE_UNAVAILABLE);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-green-100 rounded-lg">
          <Quote className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Citation Harmonizer</h4>
          <p className="text-gray-600 mb-4">
            Identify areas that need citations and suggest relevant sources to strengthen your arguments and claims.
          </p>
          <button 
            onClick={handleRun} 
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Finding Citations...
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4 mr-2" />
                Suggest Citations
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
          title="Citation Suggestions"
          content={result || ''}
          isLoading={loading}
        />
      )}
    </div>
  );
}