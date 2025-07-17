import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { Extension } from '@tiptap/core';
import { useEffect } from 'react';
import type { GrammarError } from '@/lib/ai';

// Extend the Highlight extension to support tooltips and borders
const CustomHighlight = Highlight.configure({
  multicolor: true,
  HTMLAttributes: {
    class: 'relative group',
  },
}).extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      borderColor: {
        default: null,
        parseHTML: element => element.getAttribute('data-border-color'),
        renderHTML: attributes => {
          if (!attributes.borderColor) return {};
          return {
            'data-border-color': attributes.borderColor,
            style: `border-bottom: 2px solid ${attributes.borderColor}`,
          };
        },
      },
      title: {
        default: null,
        parseHTML: element => element.getAttribute('title'),
        renderHTML: attributes => {
          if (!attributes.title) return {};
          return { title: attributes.title };
        },
      },
    };
  },
});

interface Props {
  value?: string;
  onChange: (text: string) => void;
  highlights?: GrammarError[];
  onApplyFix?: (start: number, end: number, correction: string) => void;
}

export function RichEditor({ value = '', onChange, highlights = [], onApplyFix }: Props) {
  const editor = useEditor({
    // Initialize with the value (defaults to empty string)
    onBeforeCreate({ editor }) {
      editor.setOptions({ content: value });
    },
    editable: true,
    extensions: [
      StarterKit,
      CustomHighlight,
      Placeholder.configure({
        placeholder: 'Start typing your text here...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: value,
    autofocus: 'end',
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      console.log('Editor content updated:', text); // Debug log
      onChange(text);
    },
    onCreate: ({ editor }) => {
      console.log('Editor created with content:', editor.getText());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getText()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  // Apply highlight marks with tooltips
  useEffect(() => {
    if (!editor) return;

    // Remove all existing highlights
    editor.commands.unsetHighlight();

    // Debug log highlights before processing
    console.log('Highlights to apply:', highlights);
    
    // Sort highlights by start position in descending order to avoid position shifts
    const sortedHighlights = [...highlights].sort((a, b) => b.start - a.start);

    sortedHighlights.forEach(({ start, end, type, incorrect, correction, message }) => {
      // Validate positions before applying highlight
      if (typeof start !== 'number' || typeof end !== 'number' || isNaN(start) || isNaN(end) || start < 0 || end < start) {
        console.warn('Skipping invalid highlight:', { start, end, type });
        return;
      }
      
      try {
        // TipTap uses 1-based positions, but our errors use 0-based positions
        // Convert 0-based positions to 1-based for TipTap
        const tiptapStart = start + 1;
        const tiptapEnd = end + 1;
        
        // Validate TipTap positions against document length
        const docSize = editor.state.doc.content.size;
        if (tiptapStart > docSize || tiptapEnd > docSize) {
          console.warn('Highlight position exceeds document size:', { start, end, docSize });
          return;
        }
        
        // Set text selection for the error
        editor.commands.setTextSelection({ from: tiptapStart, to: tiptapEnd });

        // Apply highlight with color based on error type
        const color = type === 'spelling' ? '#fecaca' : type === 'grammar' ? '#fef3c7' : '#dbeafe';
        const borderColor = type === 'spelling' ? '#ef4444' : type === 'grammar' ? '#f59e0b' : '#3b82f6';
        
        const tooltipText = message ? `${message} | Suggestion: ${correction}` : `${type.charAt(0).toUpperCase() + type.slice(1)} error: "${incorrect}" → "${correction}"`;
        
        // Apply highlight with custom attributes
        editor.commands.setHighlight({ color });
        
        // Apply custom attributes using updateAttributes
        editor.commands.updateAttributes('highlight', {
          borderColor,
          title: tooltipText,
        });
      } catch (error) {
        console.error('Failed to apply highlight:', { start, end, type, error });
      }
    });

    // Clear selection
    editor.commands.setTextSelection(0);
  }, [editor, highlights]);

  return (
    <div className="card flex-1 overflow-hidden bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Title Section */}
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-lg font-semibold text-gray-800">Document Editor</h2>
      </div>
      
      {/* Editor Content */}
      <div className="h-full overflow-y-auto relative">
        {/* Show placeholder when no content */}
        {(!value || value.trim() === '') && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-gray-400">
              <div className="text-xl mb-2">📝</div>
              <p className="text-lg font-medium mb-1">Start writing your document</p>
              <p className="text-sm">Click here to begin typing...</p>
            </div>
          </div>
        )}
        <style>
          {`
            .ProseMirror {
              min-height: 200px;
              padding: 1rem;
              border-radius: 0.5rem;
              outline: none;
              background: white;
            }
            .ProseMirror.is-editor-empty:first-child::before {
              content: attr(data-placeholder);
              float: left;
              color: #adb5bd;
              pointer-events: none;
              height: 0;
              font-style: italic;
            }
            .ProseMirror.is-editor-empty:first-child > *:first-child {
              min-height: 1.5em;
            }
            .ProseMirror mark[data-border-color] {
              background: transparent;
              position: relative;
              cursor: help;
            }
            .ProseMirror mark[data-border-color]:hover::after {
              content: attr(title);
              position: absolute;
              left: 0;
              bottom: 100%;
              background: #1f2937;
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 14px;
              white-space: nowrap;
              z-index: 10;
              transform: translateY(-4px);
            }
          `}
        </style>
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}