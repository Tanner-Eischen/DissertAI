import { useState } from 'react';
import { 
  Brain, 
  Quote, 
  Target, 
  UserCheck, 
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { TOOLS, ToolName } from '@/constants/tools';
import { useDocumentStore } from '@/store/useDocumentStore';
import { ThesisOptimizer } from './ai-tools/ThesisOptimizer';
import { ArgumentGraph } from './ai-tools/ArgumentGraph';
import { CitationHarmonizer } from './ai-tools/CitationHarmonizer';
import { VirtualReviewer } from './ai-tools/VirtualReviewer';
import { AbstractSynthesizer } from './ai-tools/AbstractSynthesizer';

const toolIcons = {
  'argument-mapper': Brain,
  'citation-annotator': Quote,
  'optimize-thesis': Target,
  'virtual-reviewer': UserCheck,
  'abstract-synthesizer': FileText,
} as const;

export function ToolTabs() {
  const [activeTab, setActiveTab] = useState<ToolName>('argument-mapper');
  const [isExpanded, setIsExpanded] = useState(true);
  const { currentDoc } = useDocumentStore();

  const renderTool = () => {
    if (!currentDoc) {
      return (
        <div className="p-8 text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No document loaded</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'argument-mapper':
        return <ArgumentGraph documentId={currentDoc.id} documentText={currentDoc.content || ''} />;
      case 'citation-annotator':
        return <CitationHarmonizer documentId={currentDoc.id} documentText={currentDoc.content || ''} />;
      case 'optimize-thesis':
        return <ThesisOptimizer documentId={currentDoc.id} documentText={currentDoc.content || ''} />;
      case 'virtual-reviewer':
        return <VirtualReviewer documentId={currentDoc.id} documentText={currentDoc.content || ''} />;
      case 'abstract-synthesizer':
        return <AbstractSynthesizer documentId={currentDoc.id} documentText={currentDoc.content || ''} />;
      default:
        return <div className="p-4">Unknown tool</div>;
    }
  };

  return (
    <div className="card">
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">AI Writing Tools</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>
        
        {isExpanded && (
          <div className="flex overflow-x-auto px-6">
            {TOOLS.map((tool) => {
              const Icon = toolIcons[tool.name];
              return (
                <button
                  key={tool.name}
                  onClick={() => setActiveTab(tool.name)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tool.name
                      ? 'border-primary-500 text-primary-600 bg-primary-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tool.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      
      {isExpanded && (
        <div className="min-h-[300px]">
          {renderTool()}
        </div>
      )}
    </div>
  );
}