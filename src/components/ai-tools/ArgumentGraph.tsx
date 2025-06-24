import { useState } from 'react';
import { aiService } from '@/lib/ai'; // wire below

interface Props {
  documentId: string;
  documentText: string;
}

// ls/ArgumentGraph.tsx placeholder
export function ArgumentGraph({ documentId, documentText }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleRun = async () => {
    setLoading(true);
    const res = await aiService.generateArgumentMap(documentId, documentText);
    setResult(JSON.stringify(res, null, 2));
    setLoading(false);
  };

  return (
    <div className="p-4 space-y-2">
      <button onClick={handleRun} disabled={loading}>
        {loading ? 'Analyzing…' : 'Generate Argument Graph'}
      </button>
      <pre className="bg-gray-100 p-2 text-xs whitespace-pre-wrap">{result}</pre>
    </div>
  );
}
