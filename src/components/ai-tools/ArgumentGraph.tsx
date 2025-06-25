import { useState } from 'react';
import { Brain, Loader2, Network } from 'lucide-react';
import { aiService } from '@/lib/ai';
import { ResponseDisplay } from './ResponseDisplay';

interface Props {
  documentId: string;
  documentText: string;
}

export function ArgumentGraph({ documentId, documentText }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleRun = async () => {
    if (!documentText.trim()) {
      setResult('Please add some content to your document first.');
      return;
    }

    setLoading(true);
    try {
      console.log('Sending text to argument mapper:', documentText); // Debug log
      const res = await aiService.generateArgumentMap(documentId, documentText);
      console.log('Argument mapper response:', res); // Debug log
      setResult(typeof res === 'string' ? res : JSON.stringify(res, null, 2));
    } catch (error) {
      console.error('Argument mapper error:', error); // Debug log
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-purple-100 rounded-lg">
          <Brain className="w-6 h-6 text-purple-600" />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Argument Mapper</h4>
          <p className="text-gray-600 mb-4">
            Analyze your document's logical structure and create a visual map of arguments, claims, and supporting evidence.
          </p>
          <button 
            onClick={handleRun} 
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Arguments...
              </>
            ) : (
              <>
                <Network className="w-4 h-4 mr-2" />
                Generate Argument Map
              </>
            )}
          </button>
        </div>
      </div>

      {(result || loading) && (
        <ResponseDisplay
          title="Argument Analysis"
          content={result || ''}
          isLoading={loading}
        />
      )}
    </div>
  );
}