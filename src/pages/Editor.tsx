import React, { useEffect, useState } from 'react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { createDocument, saveDocument } from '@/services/documentService';
import { checkSpelling } from '@/lib/ai';
import { RichEditor } from '@/components/RichEditor';
import { ToolTabs } from '@/components/ToolTabs';
import { Header } from '@/components/ui/Header';
import { Sidebar } from '@/components/ui/Sidebar';
import { StatusBar } from '@/components/ui/StatusBar';

export default function Editor() {
  const { currentDoc, setDoc, updateContent } = useDocumentStore();
  const [issues, setIssues] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<{ start: number; end: number }[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    (async () => {
      const doc = await createDocument();
      setDoc(doc);
    })();
  }, []);

  useEffect(() => {
    if (currentDoc?.content) {
      const words = currentDoc.content.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    } else {
      setWordCount(0);
    }
  }, [currentDoc?.content]);

  const handleCheck = async () => {
    if (!currentDoc) return;
    try {
      const result = await checkSpelling(currentDoc.id, currentDoc.content);
      setIssues(result.issues || []);
      setHighlights(result.issues?.map((i: any) => ({ start: i.start, end: i.end })) || []);
    } catch (error) {
      console.error('Spell check failed:', error);
    }
  };

  const handleSave = async () => {
    if (currentDoc) {
      try {
        await saveDocument(currentDoc.id, currentDoc.content);
      } catch (error) {
        console.error('Save failed:', error);
      }
    }
  };

  const handleContentChange = (text: string) => {
    updateContent(text);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      
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
                  value={currentDoc?.content || ''}
                  onChange={handleContentChange}
                  highlights={highlights}
                />
              </div>
              
              <div className="lg:col-span-1">
                <ToolTabs />
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