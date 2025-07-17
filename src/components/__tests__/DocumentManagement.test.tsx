import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useDocumentStore } from '../../store/useDocumentStore';
import { Sidebar } from '../ui/Sidebar';
import Editor from '../../pages/Editor';
import * as documentService from '../../services/documentService';

// Mock the document service
vi.mock('../../services/documentService', () => ({
  createDocument: vi.fn(),
  saveDocument: vi.fn(),
  loadDocuments: vi.fn(),
  deleteDocument: vi.fn(),
  updateDocumentTitle: vi.fn(),
  loadDocument: vi.fn(),
}));

// Mock other dependencies
vi.mock('../../../lib/ai', () => ({
  checkSpelling: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../RichEditor', () => ({
  RichEditor: ({ value, onChange }: any) => (
    <textarea
      data-testid="rich-editor"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock('../../ToolTabs', () => ({
  ToolTabs: () => <div data-testid="tool-tabs">Tool Tabs</div>,
}));

vi.mock('../../ui/Header', () => ({
  Header: ({ onNewDocument, onSave }: any) => (
    <div data-testid="header">
      <button onClick={onNewDocument} data-testid="new-document-btn">
        New Document
      </button>
      <button onClick={onSave} data-testid="save-btn">
        Save
      </button>
    </div>
  ),
}));

vi.mock('../../ui/StatusBar', () => ({
  StatusBar: () => <div data-testid="status-bar">Status Bar</div>,
}));

vi.mock('../../ui/Toast', () => ({
  ToastContainer: () => <div data-testid="toast-container" />,
  useToast: () => ({
    toasts: [],
    showSuccess: vi.fn(),
    showError: vi.fn(),
    removeToast: vi.fn(),
  }),
}));

describe('Document Management Operations', () => {
  const mockDocuments = [
    {
      id: '1',
      title: 'Test Document 1',
      content: 'Content of document 1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Test Document 2',
      content: 'Content of document 2',
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the document store state
    useDocumentStore.setState({ currentDoc: null });
    
    // Setup default mock implementations
    vi.mocked(documentService.loadDocuments).mockResolvedValue(mockDocuments);
    vi.mocked(documentService.createDocument).mockResolvedValue({
      id: '3',
      title: 'New Document',
      content: '',
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z',
    });
    vi.mocked(documentService.saveDocument).mockResolvedValue(undefined);
    vi.mocked(documentService.deleteDocument).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Creating New Documents', () => {
    it('should create a new document from sidebar', async () => {
      render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
      
      const newDocButton = screen.getByText('New Document');
      fireEvent.click(newDocButton);
      
      await waitFor(() => {
        expect(documentService.createDocument).toHaveBeenCalledWith('Untitled Document');
      });
      
      // Verify the document store was updated
      const store = useDocumentStore.getState();
      expect(store.currentDoc?.id).toBe('3');
      expect(store.currentDoc?.title).toBe('New Document');
    });

    it('should create a new document from header', async () => {
      render(<Editor />);
      
      const newDocButton = screen.getByTestId('new-document-btn');
      fireEvent.click(newDocButton);
      
      await waitFor(() => {
        expect(documentService.createDocument).toHaveBeenCalled();
      });
    });

    it('should handle creation errors gracefully', async () => {
      vi.mocked(documentService.createDocument).mockRejectedValue(new Error('Creation failed'));
      
      render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
      
      const newDocButton = screen.getByText('New Document');
      fireEvent.click(newDocButton);
      
      await waitFor(() => {
        expect(documentService.createDocument).toHaveBeenCalled();
      });
      
      // Document store should not be updated on error
      const store = useDocumentStore.getState();
      expect(store.currentDoc).toBeNull();
    });
  });

  describe('Saving Documents', () => {
    it('should save existing document', async () => {
      // Set up a current document
      useDocumentStore.setState({
        currentDoc: {
          id: '1',
          title: 'Test Document',
          content: 'Updated content'
        }
      });

      render(<Editor />);
      
      const saveButton = screen.getByTestId('save-btn');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(documentService.saveDocument).toHaveBeenCalledWith('1', 'Updated content');
      });
    });

    it('should save local document as new document', async () => {
      // Set up a local document (not yet saved to database)
      useDocumentStore.setState({
        currentDoc: {
          id: 'local-123456',
          title: 'Local Document',
          content: 'Local content'
        }
      });

      render(<Editor />);
      
      const saveButton = screen.getByTestId('save-btn');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(documentService.createDocument).toHaveBeenCalledWith('Local Document');
        expect(documentService.saveDocument).toHaveBeenCalledWith('3', 'Local content');
      });
    });

    it('should handle save errors gracefully', async () => {
      vi.mocked(documentService.saveDocument).mockRejectedValue(new Error('Save failed'));
      
      useDocumentStore.setState({
        currentDoc: {
          id: '1',
          title: 'Test Document',
          content: 'Content'
        }
      });

      render(<Editor />);
      
      const saveButton = screen.getByTestId('save-btn');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(documentService.saveDocument).toHaveBeenCalled();
      });
    });
  });

  describe('Switching Between Documents', () => {
    it('should switch to selected document', async () => {
      render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Document 1')).toBeInTheDocument();
      });
      
      const docButton = screen.getByText('Test Document 1');
      fireEvent.click(docButton);
      
      const store = useDocumentStore.getState();
      expect(store.currentDoc?.id).toBe('1');
      expect(store.currentDoc?.title).toBe('Test Document 1');
    });

    it('should highlight currently selected document', async () => {
      useDocumentStore.setState({
        currentDoc: mockDocuments[0]
      });

      render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
      
      await waitFor(() => {
        const selectedDoc = screen.getByText('Test Document 1').closest('div');
        expect(selectedDoc).toHaveClass('bg-primary-50');
      });
    });

    it('should update editor content when switching documents', async () => {
      render(<Editor />);
      
      // Switch to a document
      useDocumentStore.setState({
        currentDoc: mockDocuments[0]
      });
      
      await waitFor(() => {
        const editor = screen.getByTestId('rich-editor');
        expect(editor).toHaveValue('Content of document 1');
      });
    });
  });

  describe('Deleting Documents', () => {
    it('should delete document when confirmed', async () => {
      // Mock window.confirm to return true
      vi.stubGlobal('confirm', vi.fn(() => true));
      
      render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Document 1')).toBeInTheDocument();
      });
      
      // Find and click delete button (trash icon)
      const docItem = screen.getByText('Test Document 1').closest('div');
      const deleteButton = docItem?.querySelector('button');
      
      if (deleteButton) {
        fireEvent.click(deleteButton);
        
        await waitFor(() => {
          expect(documentService.deleteDocument).toHaveBeenCalledWith('1');
        });
      }
    });

    it('should not delete document when cancelled', async () => {
      // Mock window.confirm to return false
      vi.stubGlobal('confirm', vi.fn(() => false));
      
      render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Document 1')).toBeInTheDocument();
      });
      
      const docItem = screen.getByText('Test Document 1').closest('div');
      const deleteButton = docItem?.querySelector('button');
      
      if (deleteButton) {
        fireEvent.click(deleteButton);
        
        expect(documentService.deleteDocument).not.toHaveBeenCalled();
      }
    });

    it('should switch to another document when deleting current document', async () => {
      vi.stubGlobal('confirm', vi.fn(() => true));
      
      // Set current document to the one being deleted
      useDocumentStore.setState({
        currentDoc: mockDocuments[0]
      });
      
      render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Document 1')).toBeInTheDocument();
      });
      
      const docItem = screen.getByText('Test Document 1').closest('div');
      const deleteButton = docItem?.querySelector('button');
      
      if (deleteButton) {
        fireEvent.click(deleteButton);
        
        await waitFor(() => {
          expect(documentService.deleteDocument).toHaveBeenCalledWith('1');
        });
        
        // Should switch to remaining document
        const store = useDocumentStore.getState();
        expect(store.currentDoc?.id).toBe('2');
      }
    });

    it('should handle delete errors gracefully', async () => {
      vi.stubGlobal('confirm', vi.fn(() => true));
      vi.mocked(documentService.deleteDocument).mockRejectedValue(new Error('Delete failed'));
      
      render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Document 1')).toBeInTheDocument();
      });
      
      const docItem = screen.getByText('Test Document 1').closest('div');
      const deleteButton = docItem?.querySelector('button');
      
      if (deleteButton) {
        fireEvent.click(deleteButton);
        
        await waitFor(() => {
          expect(documentService.deleteDocument).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Sidebar Updates', () => {
    it('should load documents on mount', async () => {
      render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
      
      await waitFor(() => {
        expect(documentService.loadDocuments).toHaveBeenCalled();
        expect(screen.getByText('Test Document 1')).toBeInTheDocument();
        expect(screen.getByText('Test Document 2')).toBeInTheDocument();
      });
    });

    it('should refresh document list after operations', async () => {
      render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
      
      // Create a new document
      const newDocButton = screen.getByText('New Document');
      fireEvent.click(newDocButton);
      
      await waitFor(() => {
        // loadDocuments should be called twice: once on mount, once after creation
        expect(documentService.loadDocuments).toHaveBeenCalledTimes(2);
      });
    });

    it('should show empty state when no documents exist', async () => {
      vi.mocked(documentService.loadDocuments).mockResolvedValue([]);
      
      render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
      
      await waitFor(() => {
        expect(screen.getByText('No documents yet')).toBeInTheDocument();
        expect(screen.getByText('Create your first document')).toBeInTheDocument();
      });
    });

    it('should format document dates correctly', async () => {
      render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
      
      await waitFor(() => {
        // Should show formatted dates for documents
        const dateElements = screen.getAllByText(/ago|Just now/);
        expect(dateElements.length).toBeGreaterThan(0);
      });
    });

    it('should handle collapsed state correctly', () => {
      render(<Sidebar isCollapsed={true} onToggle={() => {}} />);
      
      // Should not show document list when collapsed
      expect(screen.queryByText('Documents')).not.toBeInTheDocument();
      expect(screen.queryByText('New Document')).not.toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('should complete full document workflow', async () => {
      render(<Editor />);
      
      // 1. Create new document
      const newDocButton = screen.getByTestId('new-document-btn');
      fireEvent.click(newDocButton);
      
      await waitFor(() => {
        expect(documentService.createDocument).toHaveBeenCalled();
      });
      
      // 2. Edit content
      const editor = screen.getByTestId('rich-editor');
      fireEvent.change(editor, { target: { value: 'New content' } });
      
      // 3. Save document
      const saveButton = screen.getByTestId('save-btn');
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(documentService.saveDocument).toHaveBeenCalledWith('3', 'New content');
      });
    });

    it('should handle document store state correctly', () => {
      const store = useDocumentStore.getState();
      
      // Test initial state
      expect(store.currentDoc).toBeNull();
      
      // Test setting document
      const testDoc = { id: '1', title: 'Test', content: 'Content' };
      store.setDoc(testDoc);
      expect(useDocumentStore.getState().currentDoc).toEqual(testDoc);
      
      // Test updating content
      store.updateContent('Updated content');
      expect(useDocumentStore.getState().currentDoc?.content).toBe('Updated content');
      
      // Test updating title
      store.updateTitle('Updated title');
      expect(useDocumentStore.getState().currentDoc?.title).toBe('Updated title');
    });
  });
});