import { useState } from 'react';
import { MessageSquare, Loader2, Eye, UserCheck } from 'lucide-react';
import { aiService } from '@/lib/ai';
import { ResponseDisplay } from './ResponseDisplay';

interface Props {
  documentId: string;
  documentText: string;
}

export function VirtualReviewer({ documentId, documentText }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleRun = async () => {
    if (!documentText.trim()) {
      setResult('Please add some content to your document first.');
      return;
    }

    setLoading(true);
    try {
      const res = await aiService.runVirtualReview(documentId, documentText);
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
        <div className="p-3 bg-blue-100 rounded-lg">
          <UserCheck className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Virtual Reviewer</h4>
          <p className="text-gray-600 mb-4">
            Get comprehensive feedback on your writing from an AI reviewer that evaluates structure, clarity, and academic rigor.
          </p>
          <button 
            onClick={handleRun} 
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Reviewing Document...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                Get Review
              </>
            )}
          </button>
        </div>
      </div>

      {(result || loading) && (
        <ResponseDisplay
          title="Review Feedback"
          content={result || ''}
          isLoading={loading}
        />
      )}
    </div>
  );
}