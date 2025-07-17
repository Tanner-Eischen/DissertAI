import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ToolTabs } from '../ToolTabs';
import { aiService } from '@/lib/ai';
import { useDocumentStore } from '@/store/useDocumentStore';

// Mock the AI service
vi.mock('@/lib/ai', () => ({
  aiService: {
    generateArgumentMap: vi.fn(),
    synthesizeAbstract: vi.fn(),
    suggestCitations: vi.fn(),
    runVirtualReview: vi.fn(),
    generateAbstract: vi.fn(),
  },
  checkSpelling: vi.fn(),
}));

// Mock the document store
vi.mock('@/store/useDocumentStore', () => ({
  useDocumentStore: vi.fn(),
}));

const mockUseDocumentStore = vi.mocked(useDocumentStore);
const mockAiService = vi.mocked(aiService);

describe('AI Tools Integration Tests', () => {
  const mockDocument = {
    id: 'test-doc-1',
    title: 'Test Document',
    content: 'This is a sample document with some content for testing AI tools functionality.',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup default document store state
    mockUseDocumentStore.mockReturnValue({
      currentDoc: mockDocument,
      documents: [mockDocument],
      setCurrentDoc: vi.fn(),
      addDocument: vi.fn(),
      updateDocument: vi.fn(),
      deleteDocument: vi.fn(),
    });

    // Setup default AI service responses
    mockAiService.generateArgumentMap.mockResolvedValue('Mock argument map analysis');
    mockAiService.synthesizeAbstract.mockResolvedValue('Mock thesis optimization');
    mockAiService.suggestCitations.mockResolvedValue('Mock citation suggestions');
    mockAiService.runVirtualReview.mockResolvedValue('Mock reviewer feedback');
    mockAiService.generateAbstract.mockResolvedValue('Mock abstract generation');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AI Tool Tab Loading', () => {
    it('should render all AI tool tabs without errors', () => {
      render(<ToolTabs />);
      
      // Check that all tool tabs are present
      expect(screen.getByText('Grammar Check')).toBeInTheDocument();
      expect(screen.getByText('Argument Graph')).toBeInTheDocument();
      expect(screen.getByText('Citation Fixer')).toBeInTheDocument();
      expect(screen.getByText('Thesis Optimizer')).toBeInTheDocument();
      expect(screen.getByText('Reviewer')).toBeInTheDocument();
      expect(screen.getByText('Abstract')).toBeInTheDocument();
    });

    it('should switch between tool tabs without errors', () => {
      render(<ToolTabs />);
      
      // Click on Argument Graph tab
      fireEvent.click(screen.getByText('Argument Graph'));
      expect(screen.getByText('Argument Mapper')).toBeInTheDocument();
      expect(screen.getByText('Generate Argument Map')).toBeInTheDocument();
      
      // Click on Citation Fixer tab
      fireEvent.click(screen.getByText('Citation Fixer'));
      expect(screen.getByText('Citation Harmonizer')).toBeInTheDocument();
      expect(screen.getByText('Suggest Citations')).toBeInTheDocument();
      
      // Click on Thesis Optimizer tab
      const thesisTab = screen.getByRole('button', { name: /Thesis Optimizer/ });
      fireEvent.click(thesisTab);
      expect(screen.getByText('Optimize Thesis')).toBeInTheDocument();
    });

    it('should show "No document loaded" when no document is available', () => {
      mockUseDocumentStore.mockReturnValue({
        currentDoc: null,
        documents: [],
        setCurrentDoc: vi.fn(),
        addDocument: vi.fn(),
        updateDocument: vi.fn(),
        deleteDocument: vi.fn(),
      });

      render(<ToolTabs />);
      expect(screen.getByText('No document loaded')).toBeInTheDocument();
    });
  });

  describe('Argument Mapper Tool', () => {
    it('should run argument mapper with sample text successfully', async () => {
      render(<ToolTabs />);
      
      // Switch to Argument Graph tab
      fireEvent.click(screen.getByText('Argument Graph'));
      
      // Click the Generate Argument Map button
      const generateButton = screen.getByText('Generate Argument Map');
      fireEvent.click(generateButton);
      
      // Check loading state
      expect(screen.getByText('Analyzing Arguments...')).toBeInTheDocument();
      
      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('Argument Analysis')).toBeInTheDocument();
      });
      
      // Verify AI service was called with correct parameters
      expect(mockAiService.generateArgumentMap).toHaveBeenCalledWith(
        mockDocument.id,
        mockDocument.content
      );
      
      // Check that result is displayed
      expect(screen.getByText('Mock argument map analysis')).toBeInTheDocument();
    });

    it('should handle empty document content gracefully', async () => {
      mockUseDocumentStore.mockReturnValue({
        currentDoc: { ...mockDocument, content: '' },
        documents: [mockDocument],
        setCurrentDoc: vi.fn(),
        addDocument: vi.fn(),
        updateDocument: vi.fn(),
        deleteDocument: vi.fn(),
      });

      render(<ToolTabs />);
      
      // Switch to Argument Graph tab
      fireEvent.click(screen.getByText('Argument Graph'));
      
      // Click the Generate Argument Map button
      const generateButton = screen.getByText('Generate Argument Map');
      fireEvent.click(generateButton);
      
      // Should show message about adding content
      await waitFor(() => {
        expect(screen.getByText('Please add some content to your document first.')).toBeInTheDocument();
      });
      
      // AI service should not be called
      expect(mockAiService.generateArgumentMap).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const errorMessage = 'OpenAI API error: Rate limit exceeded';
      mockAiService.generateArgumentMap.mockRejectedValue(new Error(errorMessage));

      render(<ToolTabs />);
      
      // Switch to Argument Graph tab
      fireEvent.click(screen.getByText('Argument Graph'));
      
      // Click the Generate Argument Map button
      const generateButton = screen.getByText('Generate Argument Map');
      fireEvent.click(generateButton);
      
      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
      });
    });
  });

  describe('Other AI Tools Basic Functionality', () => {
    it('should run Thesis Optimizer successfully', async () => {
      render(<ToolTabs />);
      
      // Switch to Thesis Optimizer tab
      fireEvent.click(screen.getByText('Thesis Optimizer'));
      
      // Click the Optimize Thesis button
      const optimizeButton = screen.getByText('Optimize Thesis');
      fireEvent.click(optimizeButton);
      
      // Check loading state
      expect(screen.getByText('Optimizing Thesis...')).toBeInTheDocument();
      
      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('Thesis Optimization')).toBeInTheDocument();
      });
      
      // Verify AI service was called
      expect(mockAiService.synthesizeAbstract).toHaveBeenCalledWith(
        mockDocument.id,
        mockDocument.content
      );
    });

    it('should run Citation Harmonizer successfully', async () => {
      render(<ToolTabs />);
      
      // Switch to Citation Fixer tab
      fireEvent.click(screen.getByText('Citation Fixer'));
      
      // Click the Suggest Citations button
      const findButton = screen.getByText('Suggest Citations');
      fireEvent.click(findButton);
      
      // Check loading state
      expect(screen.getByText('Finding Citations...')).toBeInTheDocument();
      
      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('Citation Suggestions')).toBeInTheDocument();
      });
      
      // Verify AI service was called
      expect(mockAiService.suggestCitations).toHaveBeenCalledWith(
        mockDocument.id,
        mockDocument.content
      );
    });

    it('should run Virtual Reviewer successfully', async () => {
      render(<ToolTabs />);
      
      // Switch to Reviewer tab
      fireEvent.click(screen.getByText('Reviewer'));
      
      // Click the Get Review button
      const reviewButton = screen.getByText('Get Review');
      fireEvent.click(reviewButton);
      
      // Check loading state
      expect(screen.getByText('Reviewing Document...')).toBeInTheDocument();
      
      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('Review Feedback')).toBeInTheDocument();
      });
      
      // Verify AI service was called
      expect(mockAiService.runVirtualReview).toHaveBeenCalledWith(
        mockDocument.id,
        mockDocument.content
      );
    });

    it('should run Abstract Synthesizer successfully', async () => {
      render(<ToolTabs />);
      
      // Switch to Abstract tab
      fireEvent.click(screen.getByText('Abstract'));
      
      // Click the Generate Abstract button
      const generateButton = screen.getByText('Generate Abstract');
      fireEvent.click(generateButton);
      
      // Check loading state
      expect(screen.getByText('Synthesizing Abstract...')).toBeInTheDocument();
      
      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('Generated Abstract')).toBeInTheDocument();
      });
      
      // Verify AI service was called
      expect(mockAiService.generateAbstract).toHaveBeenCalledWith(
        mockDocument.id,
        mockDocument.content
      );
    });
  });

  describe('Error Handling for API Failures', () => {
    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network request failed');
      mockAiService.generateArgumentMap.mockRejectedValue(networkError);

      render(<ToolTabs />);
      
      // Switch to Argument Graph tab
      fireEvent.click(screen.getByText('Argument Graph'));
      
      // Click the Generate Argument Map button
      const generateButton = screen.getByText('Generate Argument Map');
      fireEvent.click(generateButton);
      
      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByText('Error: Network request failed')).toBeInTheDocument();
      });
    });

    it('should handle API authentication errors', async () => {
      const authError = new Error('Invalid API key');
      mockAiService.synthesizeAbstract.mockRejectedValue(authError);

      render(<ToolTabs />);
      
      // Switch to Thesis Optimizer tab
      fireEvent.click(screen.getByText('Thesis Optimizer'));
      
      // Click the Optimize Thesis button
      const optimizeButton = screen.getByText('Optimize Thesis');
      fireEvent.click(optimizeButton);
      
      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByText('Error: Invalid API key')).toBeInTheDocument();
      });
    });

    it('should handle unknown errors gracefully', async () => {
      mockAiService.suggestCitations.mockRejectedValue('Unknown error');

      render(<ToolTabs />);
      
      // Switch to Citation Fixer tab
      fireEvent.click(screen.getByText('Citation Fixer'));
      
      // Click the Suggest Citations button
      const findButton = screen.getByText('Suggest Citations');
      fireEvent.click(findButton);
      
      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByText('Error: Unknown error')).toBeInTheDocument();
      });
    });

    it('should handle server errors (500) properly', async () => {
      const serverError = new Error('Internal server error');
      mockAiService.runVirtualReview.mockRejectedValue(serverError);

      render(<ToolTabs />);
      
      // Switch to Reviewer tab
      fireEvent.click(screen.getByText('Reviewer'));
      
      // Click the Get Review button
      const reviewButton = screen.getByText('Get Review');
      fireEvent.click(reviewButton);
      
      // Wait for error to be displayed
      await waitFor(() => {
        expect(screen.getByText('Error: Internal server error')).toBeInTheDocument();
      });
    });
  });

  describe('Tool State Management', () => {
    it('should maintain loading state correctly during API calls', async () => {
      // Create a promise that we can control
      let resolvePromise: (value: string) => void;
      const controlledPromise = new Promise<string>((resolve) => {
        resolvePromise = resolve;
      });
      
      mockAiService.generateArgumentMap.mockReturnValue(controlledPromise);

      render(<ToolTabs />);
      
      // Switch to Argument Graph tab
      fireEvent.click(screen.getByText('Argument Graph'));
      
      // Click the Generate Argument Map button
      const generateButton = screen.getByText('Generate Argument Map');
      fireEvent.click(generateButton);
      
      // Should show loading state
      expect(screen.getByText('Analyzing Arguments...')).toBeInTheDocument();
      expect(generateButton).toBeDisabled();
      
      // Resolve the promise
      resolvePromise!('Test result');
      
      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('Test result')).toBeInTheDocument();
      });
      
      // Button should be enabled again
      expect(generateButton).not.toBeDisabled();
    });

    it('should clear previous results when running new analysis', async () => {
      render(<ToolTabs />);
      
      // Switch to Argument Graph tab
      fireEvent.click(screen.getByText('Argument Graph'));
      
      // Run first analysis
      const generateButton = screen.getByText('Generate Argument Map');
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('Mock argument map analysis')).toBeInTheDocument();
      });
      
      // Change the mock response
      mockAiService.generateArgumentMap.mockResolvedValue('New analysis result');
      
      // Run second analysis
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('New analysis result')).toBeInTheDocument();
      });
      
      // Old result should not be present
      expect(screen.queryByText('Mock argument map analysis')).not.toBeInTheDocument();
    });
  });
});