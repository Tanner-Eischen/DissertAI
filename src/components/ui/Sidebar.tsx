import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, FileText, Plus } from 'lucide-react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { createDocument, loadDocuments } from '@/services/documentService';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentDoc, setDoc } = useDocumentStore();

  // Load documents on component mount
  useEffect(() => {
    loadDocumentList();
  }, []);

  const loadDocumentList = async () => {
    try {
      const docs = await loadDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleNewDocument = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const newDoc = await createDocument('Untitled Document');
      setDoc(newDoc);
      await loadDocumentList(); // Refresh the list
    } catch (error) {
      console.error('Failed to create document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDocument = (doc: any) => {
    setDoc(doc);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          {!isCollapsed && (
            <h2 className="text-sm font-medium text-gray-900">Documents</h2>
          )}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>

        {!isCollapsed && (
          <>
            <button 
              onClick={handleNewDocument}
              disabled={loading}
              className="btn-primary w-full mb-4 disabled:opacity-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              {loading ? 'Creating...' : 'New Document'}
            </button>

            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleSelectDocument(doc)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                    currentDoc?.id === doc.id 
                      ? 'bg-primary-50 border border-primary-200' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <FileText className={`w-4 h-4 mt-0.5 ${
                      currentDoc?.id === doc.id 
                        ? 'text-primary-600' 
                        : 'text-gray-400 group-hover:text-primary-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        currentDoc?.id === doc.id ? 'text-primary-900' : 'text-gray-900'
                      }`}>
                        {doc.title || 'Untitled Document'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(doc.updated_at || doc.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {documents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No documents yet</p>
                  <p className="text-xs">Create your first document</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}