import { FileText, FilePlus, Settings, Save, LogOut } from 'lucide-react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { signOut } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { updateDocumentTitle } from '@/services/documentService';
import { useState } from 'react';

interface HeaderProps {
  onNewDocument?: () => void;
  onSave?: () => void;
}

export function Header({ onNewDocument, onSave }: HeaderProps) {
  const { currentDoc, updateTitle } = useDocumentStore();
  const navigate = useNavigate();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const handleTitleEdit = () => {
    setTitleInput(currentDoc?.title || 'Untitled Document');
    setIsEditingTitle(true);
  };

  const handleTitleSave = async () => {
    if (!currentDoc || titleInput.trim() === '') {
      setIsEditingTitle(false);
      return;
    }

    const newTitle = titleInput.trim();
    if (newTitle === currentDoc.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      // Update local state immediately
      updateTitle(newTitle);
      setIsEditingTitle(false);

      // Only save to database if it's not a local document
      if (!currentDoc.id.startsWith('local-')) {
        await updateDocumentTitle(currentDoc.id, newTitle);
        console.log('Title updated successfully');
      }
    } catch (error) {
      console.error('Failed to update title:', error);
      // Revert local state on error
      updateTitle(currentDoc.title);
      setTitleInput(currentDoc.title);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-primary-600" />
            <h1 className="text-xl font-semibold text-gray-900">DissertAI</h1>
          </div>
          <div className="h-6 w-px bg-gray-300" />
          <div className="text-sm text-gray-600">
            {isEditingTitle ? (
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTitleSave();
                  } else if (e.key === 'Escape') {
                    setIsEditingTitle(false);
                    setTitleInput(currentDoc?.title || 'Untitled Document');
                  }
                }}
                className="bg-transparent border-b border-gray-300 focus:border-primary-500 focus:outline-none px-1 py-0.5"
                autoFocus
              />
            ) : (
              <button
                onClick={handleTitleEdit}
                className="hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                title="Click to edit title"
              >
                {currentDoc?.title || 'Untitled Document'}
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={onNewDocument}
            className="btn-secondary"
          >
            <FilePlus className="w-4 h-4 mr-2" />
            New Document
          </button>
          <button className="btn-ghost">
            <Settings className="w-4 h-4" />
          </button>
          <button 
            onClick={onSave}
            className="btn-secondary"
            disabled={!onSave}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </button>
          <button
            onClick={handleLogout}
            className="btn-ghost text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}