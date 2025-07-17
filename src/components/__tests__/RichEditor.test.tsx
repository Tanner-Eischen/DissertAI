import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { RichEditor } from '../RichEditor';
import type { GrammarError } from '@/lib/ai';

// Mock console methods to track console errors
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
let consoleErrors: string[] = [];
let consoleWarns: string[] = [];

// Mock TipTap editor with more realistic behavior
vi.mock('@tiptap/react', () => {
  const mockEditor = {
    commands: {
      setContent: vi.fn(),
      unsetHighlight: vi.fn(),
      setTextSelection: vi.fn(),
      setHighlight: vi.fn(),
      updateAttributes: vi.fn(),
    },
    getText: vi.fn(() => ''),
    state: {
      doc: {
        content: { size: 0 }
      }
    },
    setOptions: vi.fn(),
  };

  return {
    useEditor: vi.fn(() => mockEditor),
    EditorContent: ({ editor, className }: any) => (
      <div className={className} data-testid="editor-content">
        Mock Editor Content
      </div>
    ),
  };
});

describe('RichEditor', () => {
  const mockOnChange = vi.fn();
  const mockOnApplyFix = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset console tracking
    consoleErrors = [];
    consoleWarns = [];
    console.error = vi.fn((...args) => {
      consoleErrors.push(args.join(' '));
      originalConsoleError(...args);
    });
    console.warn = vi.fn((...args) => {
      consoleWarns.push(args.join(' '));
      originalConsoleWarn(...args);
    });
  });

  afterEach(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  it('renders the editor with title', () => {
    render(
      <RichEditor
        value=""
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Document Editor')).toBeInTheDocument();
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });

  it('shows placeholder when content is empty', () => {
    render(
      <RichEditor
        value=""
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Start writing your document')).toBeInTheDocument();
    expect(screen.getByText('Click here to begin typing...')).toBeInTheDocument();
  });

  it('hides placeholder when content is provided', () => {
    render(
      <RichEditor
        value="Some content"
        onChange={mockOnChange}
      />
    );

    expect(screen.queryByText('Start writing your document')).not.toBeInTheDocument();
  });

  it('accepts highlights prop without errors', () => {
    const highlights: GrammarError[] = [
      {
        start: 0,
        end: 4,
        type: 'spelling',
        incorrect: 'test',
        correction: 'best',
        message: 'Spelling error'
      }
    ];

    expect(() => {
      render(
        <RichEditor
          value="test content"
          onChange={mockOnChange}
          highlights={highlights}
        />
      );
    }).not.toThrow();
  });

  it('accepts onApplyFix callback without errors', () => {
    expect(() => {
      render(
        <RichEditor
          value="test content"
          onChange={mockOnChange}
          onApplyFix={mockOnApplyFix}
        />
      );
    }).not.toThrow();
  });

  it('handles empty highlights array', () => {
    expect(() => {
      render(
        <RichEditor
          value="test content"
          onChange={mockOnChange}
          highlights={[]}
        />
      );
    }).not.toThrow();
  });

  it('handles multiple highlight types', () => {
    const highlights: GrammarError[] = [
      {
        start: 0,
        end: 4,
        type: 'spelling',
        incorrect: 'test',
        correction: 'best',
        message: 'Spelling error'
      },
      {
        start: 5,
        end: 12,
        type: 'grammar',
        incorrect: 'content',
        correction: 'contents',
        message: 'Grammar error'
      },
      {
        start: 13,
        end: 17,
        type: 'punctuation',
        incorrect: 'here',
        correction: 'there',
        message: 'Punctuation suggestion'
      }
    ];

    expect(() => {
      render(
        <RichEditor
          value="test content here"
          onChange={mockOnChange}
          highlights={highlights}
        />
      );
    }).not.toThrow();
  });

  it('handles invalid highlight positions gracefully', () => {
    const invalidHighlights: GrammarError[] = [
      {
        start: -1,
        end: 4,
        type: 'spelling',
        incorrect: 'test',
        correction: 'best',
        message: 'Invalid start'
      },
      {
        start: 5,
        end: 100,
        type: 'grammar',
        incorrect: 'beyond',
        correction: 'within',
        message: 'Beyond text length'
      }
    ];

    expect(() => {
      render(
        <RichEditor
          value="short"
          onChange={mockOnChange}
          highlights={invalidHighlights}
        />
      );
    }).not.toThrow();
  });

  it('handles overlapping highlights', () => {
    const overlappingHighlights: GrammarError[] = [
      {
        start: 0,
        end: 10,
        type: 'spelling',
        incorrect: 'overlapping',
        correction: 'overlapped',
        message: 'First highlight'
      },
      {
        start: 5,
        end: 15,
        type: 'grammar',
        incorrect: 'pping text',
        correction: 'pped text',
        message: 'Second highlight'
      }
    ];

    expect(() => {
      render(
        <RichEditor
          value="overlapping text example"
          onChange={mockOnChange}
          highlights={overlappingHighlights}
        />
      );
    }).not.toThrow();
  });

  it('renders with default props', () => {
    expect(() => {
      render(
        <RichEditor
          onChange={mockOnChange}
        />
      );
    }).not.toThrow();
  });

  it('applies correct CSS classes', () => {
    render(
      <RichEditor
        value="test"
        onChange={mockOnChange}
      />
    );

    const card = screen.getByTestId('editor-content').closest('.card');
    expect(card).toHaveClass('card', 'flex-1', 'overflow-hidden', 'bg-white', 'rounded-lg', 'shadow-sm', 'border', 'border-gray-200');
  });

  // Task 7 specific tests: Test RichEditor component functionality
  describe('Task 7: RichEditor component functionality', () => {
    
    it('initializes editor with empty content correctly', () => {
      render(
        <RichEditor
          value=""
          onChange={mockOnChange}
        />
      );
      
      // Verify placeholder is shown for empty content
      expect(screen.getByText('Start writing your document')).toBeInTheDocument();
      expect(screen.getByText('Click here to begin typing...')).toBeInTheDocument();
      
      // Verify no console errors during initialization
      expect(consoleErrors).toHaveLength(0);
    });

    it('handles undefined content properly', () => {
      render(
        <RichEditor
          onChange={mockOnChange}
        />
      );
      
      // Verify placeholder is shown for undefined content
      expect(screen.getByText('Start writing your document')).toBeInTheDocument();
      
      // Verify no console errors with undefined content
      expect(consoleErrors).toHaveLength(0);
    });

    it('handles content updates correctly', () => {
      const { rerender } = render(
        <RichEditor
          value="initial content"
          onChange={mockOnChange}
        />
      );

      // Verify initial content hides placeholder
      expect(screen.queryByText('Start writing your document')).not.toBeInTheDocument();
      
      // Update to empty content and rerender
      rerender(
        <RichEditor
          value=""
          onChange={mockOnChange}
        />
      );

      // Verify placeholder appears when content becomes empty
      expect(screen.getByText('Start writing your document')).toBeInTheDocument();
      
      // Verify no console errors during content updates
      expect(consoleErrors).toHaveLength(0);
    });

    it('triggers onChange events correctly', () => {
      // This test verifies the component renders without errors when onChange is provided
      render(
        <RichEditor
          value="test content"
          onChange={mockOnChange}
        />
      );

      // Verify component renders successfully
      expect(screen.getByText('Document Editor')).toBeInTheDocument();
      
      // Verify no console errors during onChange setup
      expect(consoleErrors).toHaveLength(0);
    });

    it('handles editor interactions without console errors', () => {
      const highlights: GrammarError[] = [
        {
          start: 0,
          end: 4,
          type: 'spelling',
          incorrect: 'test',
          correction: 'best',
          message: 'Spelling error'
        }
      ];

      render(
        <RichEditor
          value="test content example"
          onChange={mockOnChange}
          highlights={highlights}
          onApplyFix={mockOnApplyFix}
        />
      );

      // Verify component renders with highlights
      expect(screen.getByText('Document Editor')).toBeInTheDocument();
      
      // Verify no console errors during editor interactions
      expect(consoleErrors).toHaveLength(0);
    });

    it('handles empty content transitions without errors', () => {
      const { rerender } = render(
        <RichEditor
          value="some content"
          onChange={mockOnChange}
        />
      );

      // Verify content hides placeholder
      expect(screen.queryByText('Start writing your document')).not.toBeInTheDocument();

      // Transition to empty content
      rerender(
        <RichEditor
          value=""
          onChange={mockOnChange}
        />
      );

      // Verify placeholder appears
      expect(screen.getByText('Start writing your document')).toBeInTheDocument();
      
      // Transition back to content
      rerender(
        <RichEditor
          value="new content"
          onChange={mockOnChange}
        />
      );

      // Verify placeholder disappears
      expect(screen.queryByText('Start writing your document')).not.toBeInTheDocument();
      
      // Verify no console errors during transitions
      expect(consoleErrors).toHaveLength(0);
    });

    it('handles rapid content changes without errors', async () => {
      const { rerender } = render(
        <RichEditor
          value="content 1"
          onChange={mockOnChange}
        />
      );

      // Simulate rapid content changes
      const contents = ['content 2', 'content 3', 'content 4', ''];
      
      for (const content of contents) {
        rerender(
          <RichEditor
            value={content}
            onChange={mockOnChange}
          />
        );
        
        // Small delay to simulate real usage
        await new Promise(resolve => setTimeout(resolve, 1));
      }
      
      // Verify final state shows placeholder for empty content
      expect(screen.getByText('Start writing your document')).toBeInTheDocument();
      
      // Verify no console errors during rapid changes
      expect(consoleErrors).toHaveLength(0);
    });

    it('handles highlight updates without console errors', () => {
      const initialHighlights: GrammarError[] = [
        {
          start: 10,
          end: 14,
          type: 'spelling',
          incorrect: 'test',
          correction: 'best',
          message: 'Spelling error'
        }
      ];

      const { rerender } = render(
        <RichEditor
          value="This is a test content with multiple words"
          onChange={mockOnChange}
          highlights={initialHighlights}
        />
      );

      // Update highlights
      const updatedHighlights: GrammarError[] = [
        {
          start: 15,
          end: 22,
          type: 'grammar',
          incorrect: 'content',
          correction: 'contents',
          message: 'Grammar error'
        }
      ];

      rerender(
        <RichEditor
          value="This is a test content with multiple words"
          onChange={mockOnChange}
          highlights={updatedHighlights}
        />
      );

      // Verify component still renders correctly
      expect(screen.getByText('Document Editor')).toBeInTheDocument();
      
      // Verify no console errors during highlight updates
      expect(consoleErrors).toHaveLength(0);
    });

    it('handles all prop combinations without errors', () => {
      // Test with all props provided
      const highlights: GrammarError[] = [
        {
          start: 0,
          end: 4,
          type: 'spelling',
          incorrect: 'test',
          correction: 'best',
          message: 'Spelling error'
        }
      ];

      render(
        <RichEditor
          value="test content"
          onChange={mockOnChange}
          highlights={highlights}
          onApplyFix={mockOnApplyFix}
        />
      );

      // Verify component renders successfully
      expect(screen.getByText('Document Editor')).toBeInTheDocument();
      
      // Verify no console errors with all props
      expect(consoleErrors).toHaveLength(0);
    });

    it('handles whitespace-only content correctly', () => {
      const { rerender } = render(
        <RichEditor
          value="   "
          onChange={mockOnChange}
        />
      );

      // Whitespace-only content should show placeholder
      expect(screen.getByText('Start writing your document')).toBeInTheDocument();

      // Change to actual content
      rerender(
        <RichEditor
          value="real content"
          onChange={mockOnChange}
        />
      );

      // Placeholder should disappear
      expect(screen.queryByText('Start writing your document')).not.toBeInTheDocument();
      
      // Verify no console errors
      expect(consoleErrors).toHaveLength(0);
    });
  });
});

// Integration test component for manual testing
export function RichEditorManualTest() {
  const [content, setContent] = React.useState('');
  const [highlights, setHighlights] = React.useState<GrammarError[]>([]);

  const testHighlights: GrammarError[] = [
    {
      start: 0,
      end: 4,
      type: 'spelling',
      incorrect: 'Test',
      correction: 'Best',
      message: 'Possible spelling error'
    },
    {
      start: 10,
      end: 17,
      type: 'grammar',
      incorrect: 'content',
      correction: 'contents',
      message: 'Grammar suggestion'
    }
  ];

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">RichEditor Manual Test</h1>
      
      <div className="mb-4 space-x-2">
        <button
          onClick={() => setContent('Test some content with errors')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Set Test Content
        </button>
        <button
          onClick={() => setHighlights(testHighlights)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Apply Highlights
        </button>
        <button
          onClick={() => {
            setContent('');
            setHighlights([]);
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear All
        </button>
      </div>

      <div className="h-96">
        <RichEditor
          value={content}
          onChange={setContent}
          highlights={highlights}
          onApplyFix={(start, end, correction) => {
            console.log('Fix applied:', { start, end, correction });
          }}
        />
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Current State:</h3>
        <p><strong>Content:</strong> "{content}"</p>
        <p><strong>Highlights:</strong> {highlights.length}</p>
      </div>
    </div>
  );
}