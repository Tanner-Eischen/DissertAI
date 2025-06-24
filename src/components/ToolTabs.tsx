// ToolTabs.tsx placeholder
import { useState } from 'react';
import { TOOLS, ToolName } from '@/constants/tools';
import { useDocumentStore } from '@/store/useDocumentStore';
import { ThesisOptimizer } from './ai-tools/ThesisOptimizer';
import{ ArgumentGraph } from './ai-tools/ArgumentGraph';
import { CitationHarmonizer } from './ai-tools/CitationHarmonizer';
import { VirtualReviewer } from './ai-tools/VirtualReviewer';
import { AbstractSynthesizer } from './ai-tools/AbstractSynthesizer';




export function ToolTabs() {
  const [activeTab, setActiveTab] = useState<ToolName>('spellcheck');
  const { currentDoc } = useDocumentStore();


const renderTool = () => {
  switch (activeTab) {
   // case 'spellcheck':
      //return <div className="p-4 text-gray-500">Spelling is handled inline.</div>;
    case 'argument-mapper':
      return <ArgumentGraph documentId={currentDoc?.id!} documentText={currentDoc?.content || ''} />;
    case 'citation-annotator':
      return <CitationHarmonizer documentId={currentDoc?.id!} documentText={currentDoc?.content || ''} />;
    case 'optimize-thesis':
      return <ThesisOptimizer documentId={currentDoc?.id!} documentText={currentDoc?.content || ''} />;
    case 'virtual-reviewer':
      return <VirtualReviewer documentId={currentDoc?.id!} documentText={currentDoc?.content || ''} />;
    case 'abstract-synthesizer':
      return <AbstractSynthesizer documentId={currentDoc?.id!} documentText={currentDoc?.content || ''} />;
    default:
      return <div className="p-4">Unknown tool</div>;
  }
};


  return (
    <div className="border-t mt-6">
      <div className="flex gap-2 border-b px-2 py-1">
        {TOOLS.map((tool) => (
          <button
            key={tool.name}
            onClick={() => setActiveTab(tool.name)}
            className={`px-4 py-1 text-sm rounded ${
              activeTab === tool.name ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
            }`}
          >
            {tool.label}
          </button>
        ))}
      </div>
      <div className="min-h-[120px]">{renderTool()}</div>
    </div>
  );
}
