import { useState } from 'react';
import { Target, Loader2, Zap } from 'lucide-react';
import { aiService } from '@/lib/ai';

interface Props {
  documentId: string;
  documentText: string;
}

export function ThesisOptimizer({ documentId, documentText }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleRun = async () => {
    if (!documentText.trim()) {
      setResult('Please add some content to your document first.');
      return;
    }

    setLoading(true);
    try {
      const res = await aiService.synthesizeAbstract(documentId, documentText);
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

      {result && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h5 className="font-medium text-gray-900 mb-3">Thesis Optimization</h5>
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