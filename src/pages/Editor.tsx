import React, { useEffect, useState } from 'react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { createDocument, saveDocument } from '@/services/documentService';
import { checkSpelling } from '@/lib/ai';
import { RichEditor } from '@/components/RichEditor';
import { ToolTabs } from '@/components/ToolTabs';
import { Header } from '@/components/ui/Header';
import { Sidebar } from '@/components/ui/Sidebar';
import { StatusBar } from '@/components/ui/StatusBar';
import { ToastContainer, useToast } from '@/components/ui/Toast';

export default function Editor() {
  const { currentDoc, setDoc, updateContent, refreshDocuments } = useDocumentStore();
  const { toasts, showSuccess, showError, removeToast } = useToast();

  // Initialize with a local document if none exists
  useEffect(() => {
    if (!currentDoc) {
      const localDoc = {
        id: 'local-' + Date.now(),
        title: 'Untitled Document',
        content: ''
      };
      console.log('Initializing with local document:', localDoc);
      setDoc(localDoc);
    }
  }, [currentDoc, setDoc]);
  const [issues, setIssues] = useState<{ start: number; end: number; type: 'grammar' | 'spelling' | 'punctuation'; message: string }[]>([]);
  const [highlights, setHighlights] = useState<{ start: number; end: number; type: 'grammar' | 'spelling' | 'punctuation' }[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const handleNewDocument = async () => {
    try {
      const doc = await createDocument();
      setDoc(doc);
    } catch (error) {
      console.error('Failed to create new document:', error);
    }
  };

  useEffect(() => {
    if (currentDoc?.content) {
      const words = currentDoc.content.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    } else {
      setWordCount(0);
    }
  }, [currentDoc?.content]);

  // Remove duplicate grammar checking in Editor since GrammarChecker component handles it
  const [grammarErrors, setGrammarErrors] = useState<{ start: number; end: number; type: 'grammar' | 'spelling' | 'punctuation'; message: string; incorrect: string; correction: string }[]>([]);

  const handleApplyFix = (start: number, end: number, correction: string) => {
    if (!currentDoc) return;
    
    const content = currentDoc.content || '';
    const newContent = content.slice(0, start) + correction + content.slice(end);
    updateContent(newContent);
  };

  useEffect(() => {
    setHighlights(grammarErrors);
    setIssues(grammarErrors);
  }, [grammarErrors]);


  const handleSave = async () => {
    if (currentDoc) {
      console.log('Attempting to save document:', {
        id: currentDoc.id,
        contentLength: currentDoc.content?.length || 0,
        title: currentDoc.title
      });
      
      try {
        // Check if this is a local document that needs to be created in the database
        if (currentDoc.id.startsWith('local-')) {
          console.log('Creating new document in database for local document');
          const newDoc = await createDocument(currentDoc.title);
          // Update the document with the current content
          await saveDocument(newDoc.id, currentDoc.content || '');
          // Update the local state with the new document ID
          setDoc({ ...currentDoc, id: newDoc.id });
          console.log('✅ Local document created and saved to database with ID:', newDoc.id);
          showSuccess('Document saved successfully!');
        } else {
          // Regular save for existing database documents
          await saveDocument(currentDoc.id, currentDoc.content || '');
          console.log('✅ Document saved successfully to database');
          showSuccess('Document saved successfully!');
        }
        // Refresh the document list in the sidebar
        refreshDocuments();
      } catch (error) {
        console.error('❌ Save failed:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
        showError('Failed to save document. Please try again.');
      }
    } else {
      console.warn('⚠️ No document to save');
    }
  };

  const handleContentChange = (text: string) => {
    console.log('Content change received:', text); // Debug log
    updateContent(text);
  };

  // Debug logging for document and content changes
  useEffect(() => {
    console.log('Current document state:', currentDoc);
  }, [currentDoc]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header onNewDocument={handleNewDocument} onSave={handleSave} />
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              <div className="lg:col-span-2 flex flex-col">
                <RichEditor
                  value={currentDoc?.content}
                  onChange={handleContentChange}
                  highlights={highlights}
                  onApplyFix={handleApplyFix}
                />
              </div>
              
              <div className="lg:col-span-1">
                <ToolTabs onGrammarErrorsChange={setGrammarErrors} onApplyFix={handleApplyFix} />
              </div>
            </div>
          </div>
          
          <StatusBar 
            wordCount={wordCount}
            issueCount={issues.length}
            lastSaved="just now"
          />
        </main>
      </div>
    </div>
  );
}