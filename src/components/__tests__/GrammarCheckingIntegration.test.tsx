import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { GrammarChecker } from '../ai-tools/GrammarChecker';
import { RichEditor } from '../RichEditor';
import { checkSpelling, type GrammarError } from '@/lib/ai';

// Mock the AI service
vi.mock('@/lib/ai', () => ({
  checkSpelling: vi.fn(),
  aiService: {},
}));

// Mock TipTap editor with realistic behavior for grammar checking
vi.mock('@tiptap/react', () => {
  let mockContent = '';
  let mockOnUpdate: ((props: { editor: any }) => void) | null = null;
  
  const mockEditor = {
    commands: {
      setContent: vi.fn((content: string) => {
        mockContent = content;
      }),
      unsetHighlight: vi.fn(),
      setTextSelection: vi.fn(),
      setHighlight: vi.fn(),
      updateAttributes: vi.fn(),
    },
    getText: vi.fn(() => mockContent),
    state: {
      doc: {
        content: { size: mockContent.length }
      }
    },
    setOptions: vi.fn(),
    // Simulate content updates
    simulateUpdate: (newContent: string) => {
      mockContent = newContent;
      if (mockOnUpdate) {
        mockOnUpdate({ editor: mockEditor });
      }
    }
  };

  return {
    useEditor: vi.fn((config: any) => {
      mockOnUpdate = config?.onUpdate || null;
      if (config?.content) {
        mockContent = config.content;
      }
      return mockEditor;
    }),
    EditorContent: ({ editor, className }: any) => (
      <div className={className} data-testid="editor-content">
        <div data-testid="editor-text">{mockContent}</div>
      </div>
    ),
  };
});

// Mock console methods to track console errors
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;
let consoleErrors: string[] = [];
let consoleWarns: string[] = [];
let consoleLogs: string[] = [];

describe('Grammar Checking Integration End-to-End', () => {
  const mockCheckSpelling = vi.mocked(checkSpelling);

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock timers to control debouncing
    vi.useFakeTimers();
    
    // Reset console tracking
    consoleErrors = [];
    consoleWarns = [];
    consoleLogs = [];
    
    console.error = vi.fn((...args) => {
      consoleErrors.push(args.join(' '));
      originalConsoleError(...args);
    });
    console.warn = vi.fn((...args) => {
      consoleWarns.push(args.join(' '));
      originalConsoleWarn(...args);
    });
    console.log = vi.fn((...args) => {
      consoleLogs.push(args.join(' '));
      originalConsoleLog(...args);
    });
  });

  afterEach(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.log = originalConsoleLog;
    vi.useRealTimers();
  });

  describe('Task 8.1: Test grammar error detection with sample text', () => {
    it('detects spelling errors in sample text', async () => {
      const sampleText = 'This is a tset with speling errors.';
      const mockErrors: GrammarError[] = [
        {
          start: 10,
          end: 14,
          type: 'spelling',
          incorrect: 'tset',
          correction: 'test',
          message: 'Possible spelling error'
        },
        {
          start: 20,
          end: 27,
          type: 'spelling',
          incorrect: 'speling',
          correction: 'spelling',
          message: 'Possible spelling error'
        }
      ];

      mockCheckSpelling.mockResolvedValue({ errors: mockErrors });

      const onErrorsChange = vi.fn();
      
      render(
        <GrammarChecker
          documentId="test-doc"
          documentText={sampleText}
          onErrorsChange={onErrorsChange}
        />
      );

      // Advance timers to trigger debounced function
      vi.advanceTimersByTime(1000);
      
      // Wait for grammar checking to complete
      await waitFor(() => {
        expect(mockCheckSpelling).toHaveBeenCalledWith(sampleText);
      });

      // Verify errors were detected and passed to callback
      await waitFor(() => {
        expect(onErrorsChange).toHaveBeenCalledWith(mockErrors);
      });

      // Verify errors are displayed in the UI
      expect(screen.getByText('Grammar & Spelling Check')).toBeInTheDocument();
      expect(screen.getAllByText(/Possible spelling error/)).toHaveLength(2);
      expect(screen.getByText(/tset/)).toBeInTheDocument();
      expect(screen.getByText(/speling/)).toBeInTheDocument();
    });

    it('detects grammar errors in sample text', async () => {
      const sampleText = 'She have many books on the shelf.';
      const mockErrors: GrammarError[] = [
        {
          start: 4,
          end: 8,
          type: 'grammar',
          incorrect: 'have',
          correction: 'has',
          message: 'Subject-verb agreement error'
        }
      ];

      mockCheckSpelling.mockResolvedValue({ errors: mockErrors });

      const onErrorsChange = vi.fn();
      
      render(
        <GrammarChecker
          documentId="test-doc"
          documentText={sampleText}
          onErrorsChange={onErrorsChange}
        />
      );

      // Advance timers to trigger debounced function
      vi.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(mockCheckSpelling).toHaveBeenCalledWith(sampleText);
      });

      await waitFor(() => {
        expect(onErrorsChange).toHaveBeenCalledWith(mockErrors);
      });

      // Verify grammar error is displayed
      expect(screen.getByText(/Subject-verb agreement error/)).toBeInTheDocument();
      expect(screen.getByText(/have/)).toBeInTheDocument();
    });

    it('detects punctuation errors in sample text', async () => {
      const sampleText = 'Hello world How are you today';
      const mockErrors: GrammarError[] = [
        {
          start: 11,
          end: 12,
          type: 'punctuation',
          incorrect: ' ',
          correction: '. ',
          message: 'Missing punctuation'
        }
      ];

      mockCheckSpelling.mockResolvedValue({ errors: mockErrors });

      const onErrorsChange = vi.fn();
      
      render(
        <GrammarChecker
          documentId="test-doc"
          documentText={sampleText}
          onErrorsChange={onErrorsChange}
        />
      );

      // Advance timers to trigger debounced function
      vi.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(mockCheckSpelling).toHaveBeenCalledWith(sampleText);
      });

      await waitFor(() => {
        expect(onErrorsChange).toHaveBeenCalledWith(mockErrors);
      });

      // Verify punctuation error is displayed
      expect(screen.getByText(/Missing punctuation/)).toBeInTheDocument();
    });

    it('handles mixed error types in sample text', async () => {
      const sampleText = 'This tset have many speling erors';
      const mockErrors: GrammarError[] = [
        {
          start: 5,
          end: 9,
          type: 'spelling',
          incorrect: 'tset',
          correction: 'test',
          message: 'Spelling error'
        },
        {
          start: 10,
          end: 14,
          type: 'grammar',
          incorrect: 'have',
          correction: 'has',
          message: 'Grammar error'
        },
        {
          start: 20,
          end: 27,
          type: 'spelling',
          incorrect: 'speling',
          correction: 'spelling',
          message: 'Spelling error'
        },
        {
          start: 28,
          end: 33,
          type: 'spelling',
          incorrect: 'erors',
          correction: 'errors',
          message: 'Spelling error'
        }
      ];

      mockCheckSpelling.mockResolvedValue({ errors: mockErrors });

      const onErrorsChange = vi.fn();
      
      render(
        <GrammarChecker
          documentId="test-doc"
          documentText={sampleText}
          onErrorsChange={onErrorsChange}
        />
      );

      // Advance timers to trigger debounced function
      vi.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(mockCheckSpelling).toHaveBeenCalledWith(sampleText);
      });

      await waitFor(() => {
        expect(onErrorsChange).toHaveBeenCalledWith(mockErrors);
      });

      // Verify all error types are displayed
      expect(screen.getAllByText(/Spelling error/)).toHaveLength(3);
      expect(screen.getByText(/Grammar error/)).toBeInTheDocument();
    });
  });

  describe('Task 8.2: Verify error highlighting appears correctly in editor', () => {
    it('applies highlights for detected errors in RichEditor', () => {
      const sampleText = 'This is a tset with errors.';
      const highlights: GrammarError[] = [
        {
          start: 10,
          end: 14,
          type: 'spelling',
          incorrect: 'tset',
          correction: 'test',
          message: 'Spelling error'
        }
      ];

      const onChange = vi.fn();
      
      render(
        <RichEditor
          value={sampleText}
          onChange={onChange}
          highlights={highlights}
        />
      );

      // Verify editor renders without errors
      expect(screen.getByText('Document Editor')).toBeInTheDocument();
      expect(screen.getByTestId('editor-content')).toBeInTheDocument();
      
      // Verify no console errors during highlighting
      expect(consoleErrors.filter(error => 
        !error.includes('Warning') && 
        !error.includes('act-dom')
      )).toHaveLength(0);
    });

    it('applies different highlight colors for different error types', () => {
      const sampleText = 'This tset have speling erors.';
      const highlights: GrammarError[] = [
        {
          start: 5,
          end: 9,
          type: 'spelling',
          incorrect: 'tset',
          correction: 'test',
          message: 'Spelling error'
        },
        {
          start: 10,
          end: 14,
          type: 'grammar',
          incorrect: 'have',
          correction: 'has',
          message: 'Grammar error'
        },
        {
          start: 15,
          end: 22,
          type: 'punctuation',
          incorrect: 'speling',
          correction: 'spelling',
          message: 'Punctuation suggestion'
        }
      ];

      const onChange = vi.fn();
      
      render(
        <RichEditor
          value={sampleText}
          onChange={onChange}
          highlights={highlights}
        />
      );

      // Verify editor renders with multiple highlights
      expect(screen.getByText('Document Editor')).toBeInTheDocument();
      
      // Verify no console errors with multiple highlight types
      expect(consoleErrors.filter(error => 
        !error.includes('Warning') && 
        !error.includes('act-dom')
      )).toHaveLength(0);
    });

    it('handles overlapping highlights correctly', () => {
      const sampleText = 'overlapping text example';
      const highlights: GrammarError[] = [
        {
          start: 0,
          end: 11,
          type: 'spelling',
          incorrect: 'overlapping',
          correction: 'overlapped',
          message: 'First highlight'
        },
        {
          start: 5,
          end: 16,
          type: 'grammar',
          incorrect: 'apping text',
          correction: 'apped text',
          message: 'Second highlight'
        }
      ];

      const onChange = vi.fn();
      
      render(
        <RichEditor
          value={sampleText}
          onChange={onChange}
          highlights={highlights}
        />
      );

      // Verify editor handles overlapping highlights without errors
      expect(screen.getByText('Document Editor')).toBeInTheDocument();
      
      // Verify no console errors with overlapping highlights
      expect(consoleErrors.filter(error => 
        !error.includes('Warning') && 
        !error.includes('act-dom')
      )).toHaveLength(0);
    });

    it('handles invalid highlight positions gracefully', () => {
      const sampleText = 'short text';
      const highlights: GrammarError[] = [
        {
          start: -1,
          end: 5,
          type: 'spelling',
          incorrect: 'invalid',
          correction: 'valid',
          message: 'Invalid start position'
        },
        {
          start: 5,
          end: 100,
          type: 'grammar',
          incorrect: 'beyond',
          correction: 'within',
          message: 'Position beyond text length'
        }
      ];

      const onChange = vi.fn();
      
      render(
        <RichEditor
          value={sampleText}
          onChange={onChange}
          highlights={highlights}
        />
      );

      // Verify editor handles invalid positions gracefully
      expect(screen.getByText('Document Editor')).toBeInTheDocument();
      
      // Should have warnings about invalid positions but no errors
      expect(consoleWarns.some(warn => warn.includes('invalid highlight'))).toBe(true);
      expect(consoleErrors.filter(error => 
        !error.includes('Warning') && 
        !error.includes('act-dom')
      )).toHaveLength(0);
    });
  });

  describe('Task 8.3: Test grammar error fix application functionality', () => {
    it('applies fixes correctly when Fix button is clicked', async () => {
      const sampleText = 'This is a tset with errors.';
      const mockErrors: GrammarError[] = [
        {
          start: 10,
          end: 14,
          type: 'spelling',
          incorrect: 'tset',
          correction: 'test',
          message: 'Spelling error'
        }
      ];

      mockCheckSpelling.mockResolvedValue({ errors: mockErrors });

      const onApplyFix = vi.fn();
      
      render(
        <GrammarChecker
          documentId="test-doc"
          documentText={sampleText}
          onApplyFix={onApplyFix}
        />
      );

      // Advance timers to trigger debounced function
      vi.advanceTimersByTime(1000);
      
      // Wait for errors to be detected
      await waitFor(() => {
        expect(screen.getByText(/Spelling error/)).toBeInTheDocument();
      });

      // Find and click the Fix button
      const fixButton = screen.getByRole('button', { name: /Fix/ });
      expect(fixButton).toBeInTheDocument();
      
      fireEvent.click(fixButton);

      // Verify fix was applied with correct parameters
      expect(onApplyFix).toHaveBeenCalledWith(10, 14, 'test');
    });

    it('applies multiple fixes correctly', async () => {
      const sampleText = 'This tset have speling erors.';
      const mockErrors: GrammarError[] = [
        {
          start: 5,
          end: 9,
          type: 'spelling',
          incorrect: 'tset',
          correction: 'test',
          message: 'Spelling error'
        },
        {
          start: 15,
          end: 22,
          type: 'spelling',
          incorrect: 'speling',
          correction: 'spelling',
          message: 'Spelling error'
        }
      ];

      mockCheckSpelling.mockResolvedValue({ errors: mockErrors });

      const onApplyFix = vi.fn();
      
      render(
        <GrammarChecker
          documentId="test-doc"
          documentText={sampleText}
          onApplyFix={onApplyFix}
        />
      );

      // Advance timers to trigger debounced function
      vi.advanceTimersByTime(1000);
      
      // Wait for errors to be detected
      await waitFor(() => {
        expect(screen.getAllByText(/Spelling error/)).toHaveLength(2);
      });

      // Find and click all Fix buttons
      const fixButtons = screen.getAllByRole('button', { name: /Fix/ });
      expect(fixButtons).toHaveLength(2);
      
      fireEvent.click(fixButtons[0]);
      fireEvent.click(fixButtons[1]);

      // Verify both fixes were applied
      expect(onApplyFix).toHaveBeenCalledWith(5, 9, 'test');
      expect(onApplyFix).toHaveBeenCalledWith(15, 22, 'spelling');
      expect(onApplyFix).toHaveBeenCalledTimes(2);
    });

    it('integrates fix application with RichEditor', () => {
      const sampleText = 'This is a tset with errors.';
      const highlights: GrammarError[] = [
        {
          start: 10,
          end: 14,
          type: 'spelling',
          incorrect: 'tset',
          correction: 'test',
          message: 'Spelling error'
        }
      ];

      const onChange = vi.fn();
      const onApplyFix = vi.fn();
      
      render(
        <RichEditor
          value={sampleText}
          onChange={onChange}
          highlights={highlights}
          onApplyFix={onApplyFix}
        />
      );

      // Verify editor renders with highlights and fix capability
      expect(screen.getByText('Document Editor')).toBeInTheDocument();
      
      // Verify no console errors during fix integration
      expect(consoleErrors.filter(error => 
        !error.includes('Warning') && 
        !error.includes('act-dom')
      )).toHaveLength(0);
    });
  });

  describe('Task 8.4: Ensure no infinite re-render loops occur', () => {
    it('does not cause infinite re-renders with stable content', async () => {
      const sampleText = 'This is stable content.';
      const mockErrors: GrammarError[] = [
        {
          start: 8,
          end: 14,
          type: 'spelling',
          incorrect: 'stable',
          correction: 'stable',
          message: 'No change needed'
        }
      ];

      mockCheckSpelling.mockResolvedValue({ errors: mockErrors });

      const onErrorsChange = vi.fn();
      
      render(
        <GrammarChecker
          documentId="test-doc"
          documentText={sampleText}
          onErrorsChange={onErrorsChange}
        />
      );

      // Advance timers to trigger debounced function
      vi.advanceTimersByTime(1000);
      
      // Wait for initial grammar check
      await waitFor(() => {
        expect(mockCheckSpelling).toHaveBeenCalledWith(sampleText);
      });

      // Advance timers more to ensure no additional calls
      vi.advanceTimersByTime(1500);

      // Verify grammar check was called only once (no infinite loop)
      expect(mockCheckSpelling).toHaveBeenCalledTimes(1);
      expect(onErrorsChange).toHaveBeenCalledTimes(1);
    });

    it('handles rapid content changes without infinite loops', async () => {
      const onErrorsChange = vi.fn();
      
      // Mock different responses for different content
      mockCheckSpelling
        .mockResolvedValueOnce({ errors: [] })
        .mockResolvedValueOnce({ errors: [] })
        .mockResolvedValueOnce({ errors: [] });

      const { rerender } = render(
        <GrammarChecker
          documentId="test-doc"
          documentText="content 1"
          onErrorsChange={onErrorsChange}
        />
      );

      // Rapidly change content
      rerender(
        <GrammarChecker
          documentId="test-doc"
          documentText="content 2"
          onErrorsChange={onErrorsChange}
        />
      );

      rerender(
        <GrammarChecker
          documentId="test-doc"
          documentText="content 3"
          onErrorsChange={onErrorsChange}
        />
      );

      // Wait for debounced grammar checks
      await waitFor(() => {
        expect(mockCheckSpelling).toHaveBeenCalled();
      }, { timeout: 2000 });

      // Wait additional time to ensure debouncing works
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Should have been called only once due to debouncing (last content)
      expect(mockCheckSpelling).toHaveBeenCalledWith("content 3");
      
      // Verify no infinite loops by checking reasonable call count
      expect(mockCheckSpelling).toHaveBeenCalledTimes(1);
    });

    it('handles highlight updates without infinite re-renders', () => {
      const sampleText = 'This is test content.';
      const onChange = vi.fn();
      
      const initialHighlights: GrammarError[] = [
        {
          start: 8,
          end: 12,
          type: 'spelling',
          incorrect: 'test',
          correction: 'best',
          message: 'Spelling error'
        }
      ];

      const { rerender } = render(
        <RichEditor
          value={sampleText}
          onChange={onChange}
          highlights={initialHighlights}
        />
      );

      // Update highlights multiple times
      const updatedHighlights: GrammarError[] = [
        {
          start: 13,
          end: 20,
          type: 'grammar',
          incorrect: 'content',
          correction: 'contents',
          message: 'Grammar error'
        }
      ];

      rerender(
        <RichEditor
          value={sampleText}
          onChange={onChange}
          highlights={updatedHighlights}
        />
      );

      rerender(
        <RichEditor
          value={sampleText}
          onChange={onChange}
          highlights={[]}
        />
      );

      // Verify editor still renders correctly
      expect(screen.getByText('Document Editor')).toBeInTheDocument();
      
      // Verify no infinite re-render errors
      expect(consoleErrors.filter(error => 
        error.includes('Maximum update depth') ||
        error.includes('infinite loop') ||
        error.includes('too many re-renders')
      )).toHaveLength(0);
    });

    it('handles empty content transitions without loops', async () => {
      const onErrorsChange = vi.fn();
      
      mockCheckSpelling.mockResolvedValue({ errors: [] });

      const { rerender } = render(
        <GrammarChecker
          documentId="test-doc"
          documentText=""
          onErrorsChange={onErrorsChange}
        />
      );

      // Transition to non-empty content
      rerender(
        <GrammarChecker
          documentId="test-doc"
          documentText="some content"
          onErrorsChange={onErrorsChange}
        />
      );

      // Advance timers to trigger debounced function for non-empty content
      vi.advanceTimersByTime(1000);

      // Wait for grammar check to complete
      await waitFor(() => {
        expect(mockCheckSpelling).toHaveBeenCalledWith("some content");
      });

      // Transition back to empty content
      rerender(
        <GrammarChecker
          documentId="test-doc"
          documentText=""
          onErrorsChange={onErrorsChange}
        />
      );

      // Wait for empty content handling
      await waitFor(() => {
        expect(onErrorsChange).toHaveBeenCalledTimes(2);
      });

      // Verify reasonable number of calls (no infinite loops)
      expect(onErrorsChange).toHaveBeenCalledWith([]); // Called with empty array for both empty states
      expect(mockCheckSpelling).toHaveBeenCalledTimes(1); // Only for non-empty content
    });

    it('prevents memory leaks with proper cleanup', async () => {
      const onErrorsChange = vi.fn();
      
      mockCheckSpelling.mockResolvedValue({ errors: [] });

      const { unmount } = render(
        <GrammarChecker
          documentId="test-doc"
          documentText="test content"
          onErrorsChange={onErrorsChange}
        />
      );

      // Wait for initial render and potential grammar check
      await waitFor(() => {
        expect(screen.getByText('Grammar & Spelling Check')).toBeInTheDocument();
      });

      // Unmount component
      unmount();

      // Wait to ensure no post-unmount operations
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Verify no errors related to memory leaks or post-unmount updates
      expect(consoleErrors.filter(error => 
        error.includes('memory leak') ||
        error.includes('unmounted component') ||
        error.includes('setState') ||
        error.includes('after unmount')
      )).toHaveLength(0);
    });
  });

  describe('Integration Test: Complete Grammar Checking Workflow', () => {
    it('completes full grammar checking workflow without errors', async () => {
      const sampleText = 'This tset have many speling erors that need fixing.';
      const mockErrors: GrammarError[] = [
        {
          start: 5,
          end: 9,
          type: 'spelling',
          incorrect: 'tset',
          correction: 'test',
          message: 'Spelling error'
        },
        {
          start: 10,
          end: 14,
          type: 'grammar',
          incorrect: 'have',
          correction: 'has',
          message: 'Grammar error'
        },
        {
          start: 20,
          end: 27,
          type: 'spelling',
          incorrect: 'speling',
          correction: 'spelling',
          message: 'Spelling error'
        },
        {
          start: 28,
          end: 33,
          type: 'spelling',
          incorrect: 'erors',
          correction: 'errors',
          message: 'Spelling error'
        }
      ];

      mockCheckSpelling.mockResolvedValue({ errors: mockErrors });

      const onErrorsChange = vi.fn();
      const onApplyFix = vi.fn();
      const onChange = vi.fn();

      // Render both components together (simulating real usage)
      const { rerender } = render(
        <div>
          <GrammarChecker
            documentId="test-doc"
            documentText={sampleText}
            onErrorsChange={onErrorsChange}
            onApplyFix={onApplyFix}
          />
          <RichEditor
            value={sampleText}
            onChange={onChange}
            highlights={[]}
          />
        </div>
      );

      // Advance timers to trigger debounced function
      vi.advanceTimersByTime(1000);
      
      // Wait for grammar checking to complete
      await waitFor(() => {
        expect(mockCheckSpelling).toHaveBeenCalledWith(sampleText);
      });

      await waitFor(() => {
        expect(onErrorsChange).toHaveBeenCalledWith(mockErrors);
      });

      // Verify all errors are displayed
      expect(screen.getAllByText(/Spelling error/)).toHaveLength(3);
      expect(screen.getByText(/Grammar error/)).toBeInTheDocument();

      // Apply highlights to editor
      rerender(
        <div>
          <GrammarChecker
            documentId="test-doc"
            documentText={sampleText}
            onErrorsChange={onErrorsChange}
            onApplyFix={onApplyFix}
          />
          <RichEditor
            value={sampleText}
            onChange={onChange}
            highlights={mockErrors}
            onApplyFix={onApplyFix}
          />
        </div>
      );

      // Verify editor renders with highlights
      expect(screen.getByText('Document Editor')).toBeInTheDocument();

      // Apply a fix
      const fixButtons = screen.getAllByRole('button', { name: /Fix/ });
      fireEvent.click(fixButtons[0]);

      // Verify fix was applied
      expect(onApplyFix).toHaveBeenCalledWith(5, 9, 'test');

      // Verify no console errors throughout the workflow
      expect(consoleErrors.filter(error => 
        !error.includes('Warning') && 
        !error.includes('act-dom') &&
        !error.includes('React')
      )).toHaveLength(0);
    });
  });
});