import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useDocumentStore } from '../../store/useDocumentStore';
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

// Simple mock components to test integration
const MockSidebar = ({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle: () => void }) => {
  const { currentDoc, setDoc } = useDocumentStore();
  const [documents, setDocuments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    loadDocumentList();
  }, []);

  const loadDocumentList = async () => {
    try {
      const docs = await documentService.loadDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleNewDocument = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const newDoc = await documentService.createDocument('Untitled Document');
      setDoc(newDoc);
      await loadDocumentList();
    } catch (error) {
      console.error('Failed to create document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDocument = (doc: any) => {
    setDoc(doc);
  };

  const handleDeleteDocument = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await documentService.deleteDocument(id);
      if (currentDoc?.id === id) {
        const remainingDocs = documents.filter(doc => doc.id !== id);
        setDoc(remainingDocs.length > 0 ? remainingDocs[0] : null);
      }
      await loadDocumentList();
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  if (isCollapsed) {
    return <div data-testid="sidebar-collapsed">Collapsed</div>;
  }

  return (
    <div data-testid="sidebar">
      <button onClick={onToggle} data-testid="toggle-sidebar">Toggle</button>
      <button 
        onClick={handleNewDocument}
        disabled={loading}
        data-testid="new-document-btn"
      >
        {loading ? 'Creating...' : 'New Document'}
      </button>
      
      <div data-testid="document-list">
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => handleSelectDocument(doc)}
            data-testid={`document-${doc.id}`}
            className={currentDoc?.id === doc.id ? 'selected' : ''}
          >
            <span>{doc.title}</span>
            <button
              onClick={(e) => handleDeleteDocument(doc.id, e)}
              data-testid={`delete-${doc.id}`}
            >
              Delete
            </button>
          </div>
        ))}
        
        {documents.length === 0 && (
          <div data-testid="empty-state">No documents yet</div>
        )}
      </div>
    </div>
  );
};

const MockEditor = () => {
  const { currentDoc, updateContent } = useDocumentStore();

  const handleSave = async () => {
    if (currentDoc) {
      try {
        if (currentDoc.id.startsWith('local-')) {
          const newDoc = await documentService.createDocument(currentDoc.title);
          await documentService.saveDocument(newDoc.id, currentDoc.content || '');
        } else {
          await documentService.saveDocument(currentDoc.id, currentDoc.content || '');
        }
      } catch (error) {
        console.error('Save failed:', error);
      }
    }
  };

  return (
    <div data-testid="editor">
      <button onClick={handleSave} data-testid="save-btn">Save</button>
      <textarea
        data-testid="editor-content"
        value={currentDoc?.content || ''}
        onChange={(e) => updateContent(e.target.value)}
      />
      <div data-testid="current-doc-title">{currentDoc?.title || 'No document'}</div>
    </div>
  );
};

// Import React after defining components
import React from 'react';

describe('Document Management Integration Tests', () => {
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
    useDocumentStore.setState({ currentDoc: null });
    
    vi.mocked(documentService.loadDocuments).mockResolvedValue(mockDocuments);
    vi.mocked(documentService.createDocument).mockResolvedValue({
      id: '3',
      title: 'Untitled Document',
      content: '',
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z',
    });
    vi.mocked(documentService.saveDocument).mockResolvedValue(undefined);
    vi.mocked(documentService.deleteDocument).mockResolvedValue(undefined);
  });

  const TestApp = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
    
    return (
      <div data-testid="app">
        <MockSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
        <MockEditor />
      </div>
    );
  };

  describe('Full Document Management Workflow', () => {
    it('should load and display documents on startup', async () => {
      render(<TestApp />);
      
      await waitFor(() => {
        expect(screen.getByTestId('document-1')).toBeInTheDocument();
        expect(screen.getByTestId('document-2')).toBeInTheDocument();
        expect(screen.getByText('Test Document 1')).toBeInTheDocument();
        expect(screen.getByText('Test Document 2')).toBeInTheDocument();
      });
      
      expect(documentService.loadDocuments).toHaveBeenCalled();
    });

    it('should create new document and update UI', async () => {
      render(<TestApp />);
      
      const newDocBtn = screen.getByTestId('new-document-btn');
      fireEvent.click(newDocBtn);
      
      await waitFor(() => {
        expect(documentService.createDocument).toHaveBeenCalledWith('Untitled Document');
        expect(screen.getByText('Untitled Document')).toBeInTheDocument();
      });
    });

    it('should switch between documents', async () => {
      render(<TestApp />);
      
      await waitFor(() => {
        expect(screen.getByTestId('document-1')).toBeInTheDocument();
      });
      
      // Click on first document
      fireEvent.click(screen.getByTestId('document-1'));
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Content of document 1')).toBeInTheDocument();
        expect(screen.getByText('Test Document 1')).toBeInTheDocument();
      });
      
      // Click on second document
      fireEvent.click(screen.getByTestId('document-2'));
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Content of document 2')).toBeInTheDocument();
        expect(screen.getByText('Test Document 2')).toBeInTheDocument();
      });
    });

    it('should edit and save document content', async () => {
      render(<TestApp />);
      
      await waitFor(() => {
        expect(screen.getByTestId('document-1')).toBeInTheDocument();
      });
      
      // Select first document
      fireEvent.click(screen.getByTestId('document-1'));
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Content of document 1')).toBeInTheDocument();
      });
      
      // Edit content
      const editor = screen.getByTestId('editor-content');
      fireEvent.change(editor, { target: { value: 'Updated content' } });
      
      expect(screen.getByDisplayValue('Updated content')).toBeInTheDocument();
      
      // Save document
      fireEvent.click(screen.getByTestId('save-btn'));
      
      await waitFor(() => {
        expect(documentService.saveDocument).toHaveBeenCalledWith('1', 'Updated content');
      });
    });

    it('should delete document and update UI', async () => {
      vi.stubGlobal('confirm', vi.fn(() => true));
      
      render(<TestApp />);
      
      await waitFor(() => {
        expect(screen.getByTestId('document-1')).toBeInTheDocument();
      });
      
      // Select first document
      fireEvent.click(screen.getByTestId('document-1'));
      
      await waitFor(() => {
        expect(screen.getByText('Test Document 1')).toBeInTheDocument();
      });
      
      // Delete the document
      fireEvent.click(screen.getByTestId('delete-1'));
      
      await waitFor(() => {
        expect(documentService.deleteDocument).toHaveBeenCalledWith('1');
        // Should switch to remaining document
        expect(screen.getByText('Test Document 2')).toBeInTheDocument();
      });
    });

    it('should handle local document save workflow', async () => {
      // Set up a local document
      useDocumentStore.setState({
        currentDoc: {
          id: 'local-123456',
          title: 'Local Document',
          content: 'Local content'
        }
      });

      render(<TestApp />);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Local content')).toBeInTheDocument();
        expect(screen.getByText('Local Document')).toBeInTheDocument();
      });
      
      // Save the local document
      fireEvent.click(screen.getByTestId('save-btn'));
      
      await waitFor(() => {
        expect(documentService.createDocument).toHaveBeenCalledWith('Local Document');
        expect(documentService.saveDocument).toHaveBeenCalledWith('3', 'Local content');
      });
    });

    it('should show empty state when no documents exist', async () => {
      vi.mocked(documentService.loadDocuments).mockResolvedValue([]);
      
      render(<TestApp />);
      
      await waitFor(() => {
        expect(screen.getByTestId('empty-state')).toBeInTheDocument();
        expect(screen.getByText('No documents yet')).toBeInTheDocument();
      });
    });

    it('should handle sidebar collapse/expand', () => {
      render(<TestApp />);
      
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.queryByTestId('sidebar-collapsed')).not.toBeInTheDocument();
      
      // Toggle sidebar
      fireEvent.click(screen.getByTestId('toggle-sidebar'));
      
      expect(screen.getByTestId('sidebar-collapsed')).toBeInTheDocument();
      expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    });

    it('should handle document selection highlighting', async () => {
      render(<TestApp />);
      
      await waitFor(() => {
        expect(screen.getByTestId('document-1')).toBeInTheDocument();
      });
      
      // Select first document
      fireEvent.click(screen.getByTestId('document-1'));
      
      await waitFor(() => {
        const selectedDoc = screen.getByTestId('document-1');
        expect(selectedDoc).toHaveClass('selected');
      });
      
      // Select second document
      fireEvent.click(screen.getByTestId('document-2'));
      
      await waitFor(() => {
        const firstDoc = screen.getByTestId('document-1');
        const secondDoc = screen.getByTestId('document-2');
        expect(firstDoc).not.toHaveClass('selected');
        expect(secondDoc).toHaveClass('selected');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle document creation errors', async () => {
      vi.mocked(documentService.createDocument).mockRejectedValue(new Error('Creation failed'));
      
      render(<TestApp />);
      
      const newDocBtn = screen.getByTestId('new-document-btn');
      fireEvent.click(newDocBtn);
      
      await waitFor(() => {
        expect(documentService.createDocument).toHaveBeenCalled();
        // Should not crash and button should be enabled again
        expect(screen.getByText('New Document')).toBeInTheDocument();
      });
    });

    it('should handle document deletion errors', async () => {
      vi.stubGlobal('confirm', vi.fn(() => true));
      vi.mocked(documentService.deleteDocument).mockRejectedValue(new Error('Delete failed'));
      
      render(<TestApp />);
      
      await waitFor(() => {
        expect(screen.getByTestId('document-1')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByTestId('delete-1'));
      
      await waitFor(() => {
        expect(documentService.deleteDocument).toHaveBeenCalled();
        // Document should still be visible since delete failed
        expect(screen.getByTestId('document-1')).toBeInTheDocument();
      });
    });

    it('should handle save errors gracefully', async () => {
      vi.mocked(documentService.saveDocument).mockRejectedValue(new Error('Save failed'));
      
      render(<TestApp />);
      
      await waitFor(() => {
        expect(screen.getByTestId('document-1')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByTestId('document-1'));
      fireEvent.click(screen.getByTestId('save-btn'));
      
      await waitFor(() => {
        expect(documentService.saveDocument).toHaveBeenCalled();
        // Should not crash the application
        expect(screen.getByTestId('editor')).toBeInTheDocument();
      });
    });
  });
});