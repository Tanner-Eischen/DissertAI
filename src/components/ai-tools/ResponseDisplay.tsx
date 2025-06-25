import React from 'react';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface Props {
  title: string;
  content: string;
  isLoading?: boolean;
}

export function ResponseDisplay({ title, content, isLoading = false }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  // Function to clean and format the content with better styling
  const formatContent = (text: string) => {
    // Clean unwanted symbols and formatting artifacts but preserve markdown
    const cleanedText = text
      .replace(/^\s*[\[\{]\s*$/gm, '') // Remove standalone opening brackets
      .replace(/^\s*[\]\}]\s*$/gm, '') // Remove standalone closing brackets
      .replace(/\}\s*$/gm, '') // Remove trailing } symbols
      .replace(/\{\s*$/gm, '') // Remove trailing { symbols
      .replace(/```[a-zA-Z]*\n?/g, '') // Remove code block markers
      .replace(/\*\*\*([^*]+)\*\*\*/g, '**$1**') // Convert triple asterisks to double
      .replace(/^\s*"([^"]+)"\s*$/gm, '$1') // Remove quotes around standalone quoted strings
      .replace(/^\s*"([^"]+)"\s*,?\s*$/gm, '$1') // Remove quotes and trailing commas
      .replace(/^\s*,\s*$/gm, '') // Remove standalone commas
      .trim();
    
    const lines = cleanedText.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: string[] = [];
    let currentListType: 'ordered' | 'unordered' | null = null;
    
    const flushList = () => {
      if (currentList.length > 0) {
        const ListComponent = currentListType === 'ordered' ? 'ol' : 'ul';
        const listClass = currentListType === 'ordered' 
          ? 'list-decimal list-inside space-y-3 mb-6 pl-4 bg-gray-50 rounded-lg p-4'
          : 'list-disc list-inside space-y-3 mb-6 pl-4 bg-blue-50 rounded-lg p-4 border-l-4 border-blue-200';
        
        elements.push(
          <ListComponent key={elements.length} className={listClass}>
            {currentList.map((item, idx) => {
              // Check if this is a citation-specific item
              const isCitation = item.match(/^(Citation|Source|Reference|Suggested|Recommended)\s*:?/i);
              const itemClass = isCitation 
                ? "text-gray-800 leading-relaxed font-medium"
                : "text-gray-700 leading-relaxed";
              
              return (
                <li key={idx} className={itemClass}>
                  {item}
                </li>
              );
            })}
          </ListComponent>
        );
        currentList = [];
        currentListType = null;
      }
    };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) {
        flushList();
        continue;
      }
      
      // Check for headings (# ## ### or ALL CAPS short lines or **bold** headings)
      if (line.startsWith('#')) {
        flushList();
        const level = line.match(/^#+/)?.[0].length || 1;
        const text = line.replace(/^#+\s*/, '').replace(/\*\*/g, '');
        const HeadingTag = `h${Math.min(level + 2, 6)}` as keyof JSX.IntrinsicElements;
        const headingClass = level === 1 
          ? 'text-xl font-bold text-gray-900 mt-6 mb-4 first:mt-0 border-b border-gray-200 pb-2'
          : level === 2
          ? 'text-lg font-semibold text-gray-900 mt-5 mb-3 first:mt-0'
          : 'text-base font-semibold text-gray-900 mt-4 mb-2 first:mt-0';
        
        elements.push(
          <HeadingTag key={elements.length} className={headingClass}>
            {text}
          </HeadingTag>
        );
      }
      // Check for **bold** headings (likely section headers) - enhanced for citations
      else if (line.match(/^\*\*[^*]+\*\*\s*:?\s*$/) || line.match(/^\*\*[A-Z][^*]*\*\*$/)) {
        flushList();
        const text = line.replace(/\*\*/g, '').replace(/:$/, '');
        elements.push(
          <h4 key={elements.length} className="text-lg font-semibold text-gray-900 mt-5 mb-3 first:mt-0 text-blue-800">
            {text}
          </h4>
        );
      }
      // Check for citation-specific patterns like "Citation Needed:" or "Sources:"
      else if (line.match(/^(Citation[s]?\s*(Needed|Required|Suggestions?)|Sources?|References?|Recommended\s*Citations?)\s*:?\s*$/i)) {
        flushList();
        elements.push(
          <h4 key={elements.length} className="text-lg font-semibold text-blue-700 mt-5 mb-3 first:mt-0 border-l-4 border-blue-500 pl-3">
            {line.replace(/:$/, '')}
          </h4>
        );
      }
      // Check for ALL CAPS headings (short lines)
      else if (line.length < 80 && line === line.toUpperCase() && line.includes(' ') && !line.match(/^\d+\.|^[•\-\*]/)) {
        flushList();
        elements.push(
          <h4 key={elements.length} className="text-base font-semibold text-gray-900 mt-4 mb-2 first:mt-0">
            {line}
          </h4>
        );
      }
      // Check for numbered lists
      else if (line.match(/^\d+\.\s/)) {
        const text = line.replace(/^\d+\.\s*/, '');
        if (currentListType !== 'ordered') {
          flushList();
          currentListType = 'ordered';
        }
        currentList.push(text);
      }
      // Check for bullet points (including markdown style and citation-specific patterns)
      else if (line.match(/^[•\-\*]\s/) || line.match(/^\s*[•\-\*]\s/) || line.match(/^\s*[→▸▪▫]\s/)) {
        const text = line.replace(/^\s*[•\-\*→▸▪▫]\s*/, '').replace(/\*\*/g, '');
        if (currentListType !== 'unordered') {
          flushList();
          currentListType = 'unordered';
        }
        currentList.push(text);
      }
      // Check for citation-specific bullet patterns like "- Citation:" or "• Source:"
      else if (line.match(/^\s*[•\-\*]\s*(Citation|Source|Reference|Suggested|Recommended)\s*:?/i)) {
        const text = line.replace(/^\s*[•\-\*]\s*/, '');
        if (currentListType !== 'unordered') {
          flushList();
          currentListType = 'unordered';
        }
        currentList.push(text);
      }
      // Regular paragraph text
      else {
        flushList();
        
        // Look ahead to collect multi-line paragraphs
        let paragraphText = line;
        let j = i + 1;
        while (j < lines.length && lines[j].trim() && 
               !lines[j].trim().startsWith('#') && 
               !lines[j].trim().match(/^\d+\.\s/) && 
               !lines[j].trim().match(/^[•\-\*]\s/) &&
               !(lines[j].trim().length < 80 && lines[j].trim() === lines[j].trim().toUpperCase() && lines[j].trim().includes(' '))) {
          paragraphText += ' ' + lines[j].trim();
          j++;
        }
        i = j - 1; // Skip the lines we've already processed
        
        if (paragraphText) {
          // Handle bold text within paragraphs
          const formattedText = paragraphText.split(/\*\*([^*]+)\*\*/).map((part, index) => {
            if (index % 2 === 1) {
              return <strong key={index} className="font-semibold">{part}</strong>;
            }
            return part;
          });
          
          elements.push(
            <p key={elements.length} className="text-gray-700 mb-4 leading-relaxed">
              {formattedText}
            </p>
          );
        }
      }
    }
    
    // Flush any remaining list
    flushList();
    
    return elements;
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-300 rounded w-full"></div>
            <div className="h-3 bg-gray-300 rounded w-5/6"></div>
            <div className="h-3 bg-gray-300 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h5 className="font-semibold text-gray-900">{title}</h5>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="prose prose-sm max-w-none text-gray-800">
          {formatContent(content)}
        </div>
      </div>
    </div>
  );
}