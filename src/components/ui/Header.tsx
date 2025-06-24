import { FileText, Save, Settings } from 'lucide-react';
import { useDocumentStore } from '@/store/useDocumentStore';

export function Header() {
  const { currentDoc } = useDocumentStore();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-primary-600" />
            <h1 className="text-xl font-semibold text-gray-900">Word-Wise</h1>
          </div>
          <div className="h-6 w-px bg-gray-300" />
          <div className="text-sm text-gray-600">
            {currentDoc?.title || 'Untitled Document'}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="btn-ghost">
            <Settings className="w-4 h-4" />
          </button>
          <button className="btn-secondary">
            <Save className="w-4 h-4 mr-2" />
            Save
          </button>
        </div>
      </div>
    </header>
  );
}