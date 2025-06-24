// src/pages/Editor.tsx
import React, { useEffect, useState } from 'react';
import { useDocumentStore } from '@/store/useDocumentStore';
import { createDocument, saveDocument } from '@/services/documentService';
import { checkSpelling } from '@/lib/ai';
import { RichEditor } from '@/components/RichEditor';
import { ToolTabs } from '@/components/ToolTabs';

export default function Editor() {
  const { currentDoc, setDoc, updateContent } = useDocumentStore();
  const [issues, setIssues] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<{ start: number; end: number }[]>([]);

  useEffect(() => {
    (async () => {
      const doc = await createDocument();
      setDoc(doc);
    })();
  }, []);

  const handleCheck = async () => {
    if (!currentDoc) return;
    const result = await checkSpelling(currentDoc.id, currentDoc.content);
    setIssues(result.issues || []);
    setHighlights(result.issues?.map((i: any) => ({ start: i.start, end: i.end })) || []);
  };

  const handleSave = async () => {
    if (currentDoc) await saveDocument(currentDoc.id, currentDoc.content);
  };

  return (
    <div className="p-4 space-y-4">
      <RichEditor
        value={currentDoc?.content || ''}
        onChange={(text) => updateContent(text)}
        highlights={highlights}
      />
      <div className="flex gap-4">
        {/* <button onClick={handleCheck}>Check Spelling</button> */}
        {/* <button onClick={handleSave}>Save</button> */}
      </div>
      <ToolTabs />
      <ul className="text-sm">
        {issues.map((i, idx) => (
          <li key={idx}>{i.message}</li>
        ))}
      </ul>
    </div>
  );
}

