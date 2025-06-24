import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface StatusBarProps {
  wordCount: number;
  issueCount: number;
  lastSaved?: string;
}

export function StatusBar({ wordCount, issueCount, lastSaved }: StatusBarProps) {
  return (
    <div className="bg-white border-t border-gray-200 px-6 py-2">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1">
            <span>{wordCount} words</span>
          </div>
          
          <div className="flex items-center space-x-1">
            {issueCount > 0 ? (
              <>
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-amber-600">{issueCount} issues</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-green-600">No issues</span>
              </>
            )}
          </div>
        </div>

        {lastSaved && (
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>Saved {lastSaved}</span>
          </div>
        )}
      </div>
    </div>
  );
}