import { useState } from 'react';
import { Quote, Loader2, BookOpen } from 'lucide-react';
import { aiService } from '@/lib/ai';

type Props = {
  documentId: string;
  documentText: string;
};

export function CitationHarmonizer({ documentId, documentText }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleRun = async () => {
    if (!documentText.trim()) {
      setResult('Please add some content to your document first.');
      return;
    }

    setLoading(true);
    try {
      const res = await aiService.suggestCitations(documentId, documentText);
      setResult(typeof res === 'string' ? res : JSON.stringify(res, null, 2));
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
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

      {result && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h5 className="font-medium text-gray-900 mb-3">Citation Suggestions</h5>
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
              {result}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}